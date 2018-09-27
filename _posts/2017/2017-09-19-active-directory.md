---
layout: post
date: 2017-09-19 00:00
title: Lab - Active Directory
tags:
- powershell
- powershell dsc
categories:
- lab
---

![active-directory-banner](/assets/img/2017/lab/active-directory-banner.png#banner)

Cet article montre comment créer un environnement Active Directory dans le cadre de l'élaboration d'une infrastructure de Test.

Pour le deploiement du Role «**AD-Domain-Services**» nous utiliserons **Powershell** ou **Powershell DSC** ce qui vous permettra d'avoir une certaine consistance sur la configuration du rôle contrairement a l'opération via l'interface Graphique.

<!--more-->

## Configuration de l'environnement

Avant de pouvoir effectuer la configuration du Rôle, je vous invite à effectuer quelques configurations système à l'aide de Powershell

```powershell
# Set Network configuration
$NetAdapter = Get-NetAdapter
$NetAdapter | New-NetIPAddress -IPAddress 172.16.10.12 -PrefixLength 24 -DefaultGateway 172.16.10.254
$NetAdapter | Set-DNSClientServerAddress -ServerAddresses 8.8.8.8

# Rename computer
Rename-Computer -NewName SRV-AD01

# Restart
restart-computer
```

## Installation

### Powershell

Le script ci-dessous vous permettra d'installer le rôle «**AD-Domain-Services**» et d'effectuer l'installation de ce dernier.

```powershell
# Install Windows Feature
install-windowsfeature AD-Domain-Services

# Install AD Forest
$Params = @{
    SafeModeAdministratorPassword = (ConvertTo-SecureString 'P@ssw0rd' -AsPlainText -Force)
    ForestMode                    = "WinThreshold"
    DomainMode                    = "WinThreshold"
    DomainName                    = "Netboot.lab"
    DomainNetbiosName             = "NETBOOT"
    DatabasePath                  = "C:\Windows\NTDS"
    SysvolPath                    = "C:\Windows\SYSVOL"
    LogPath                       = "C:\Windows\NTDS"
    InstallDns                    = $true
    CreateDnsDelegation           = $false
    NoRebootOnCompletion          = $false
    Force                         = $true
}
Install-ADDSForest @Params
```

Une fois que le serveur a effectué l'installation de l'Active Directory, vous pouvez effectuer les opérations ci-dessous, qui permettront d'activer la Cobeille AD et de forcer la génération d'une clef Kerberos.

```powershell
# Enable AD Recycle bin
$Params = @{
    Identity = 'CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=netboot,DC=lab'
    Scope = "ForestOrConfigurationSet"
    Target = "Netboot.lab"
}
Enable-ADOptionalFeature @Params

# Install a KDS Root Key so we can create MSA/gMSA accounts
If (-not (Get-KDSRootKey)) {
    Write-Verbose -Message "KDS Root Key Needs to be installed..."
    Add-KDSRootKey -EffectiveTime ((Get-Date).AddHours(-10))
}
```

### Powershell DSC

A l'aide de [Powershell DSC](/powershell/desired-state-configuration/introduction) nous allons effectuer la configuration de votre contrôleur de domaine. La configuration que je vous partage peu être exécutées directement sur le serveur ou bien via un [Serveur Pull]().

#### Prérequis

Avant de pouvoir effectuer l'exécution de cette configuration, vous allez devoir effectuer l'installation de quelques modules Powershell DSC a l'aide des commandes ci-dessous.

```powershell
Install-PackageProvider -Name NuGet -Force
Install-Module xPSDesiredStateConfiguration, xActiveDirectory, xDNSServer -force
```

![active-directory-01](/assets/img/2017/lab/active-directory-01.png#center)

#### Configuration

La configuration ci-dessous vous permettra d'effectuer automatiquement les tâches suivantes :

- **Installation** de fonctionnalités : Windows-Server-Backup, DNS, AD-Domain-Services
- **Installation** des outils d'administrations : RSAT-AD-PowerShell, RSAT-AD-Tools, RSAT-DNS-Server
- **Configuration** de l'Active Directory
- **Activation** de la Corbeille AD
- Forcer la **génération** de la clef Root de **Kerberos**

Vous noterez que dans cette configuration on utilise le mode «**ApplyOnly**» ce qui permet d'éviter de rejouer la configuration toutes les 15 minutes.

```powershell
Configuration SetupActiveDirectory
{
    Import-DscResource -ModuleName PSDesiredStateConfiguration
    Import-DscResource -ModuleName xActiveDirectory
    Import-DscResource -ModuleName xDNSServer

    Node $AllNodes.NodeName {

        # Assemble the Local Admin Credentials
        If ($Node.LocalAdminPassword) {
            [PSCredential]$LocalAdminCredential = New-Object System.Management.Automation.PSCredential ("Administrator", (ConvertTo-SecureString $Node.LocalAdminPassword -AsPlainText -Force))
        }

        If ($Node.DomainAdminPassword) {
            [PSCredential]$DomainAdminCredential = New-Object System.Management.Automation.PSCredential ("Administrator", (ConvertTo-SecureString $Node.DomainAdminPassword -AsPlainText -Force))
        }

        # Setup Local Configuration Manager
        LocalConfigurationManager
        {
            ActionAfterReboot = 'ContinueConfiguration'
            ConfigurationMode = 'ApplyOnly'
            RebootNodeIfNeeded = $true
        }

        WindowsFeature DNSInstall
        {
            Ensure = "Present"
            Name   = "DNS"
        }

        WindowsFeature ADDSInstall
        {
            Ensure    = "Present"
            Name      = "AD-Domain-Services"
            DependsOn = "[WindowsFeature]DNSInstall"
        }

        WindowsFeature RSAT-AD-PowerShellInstall
        {
            Ensure    = "Present"
            Name      = "RSAT-AD-PowerShell"
            DependsOn = "[WindowsFeature]ADDSInstall"
        }

        if ($Node.InstallRSATTools -eq $true)
        {
            WindowsFeature RSAT-ManagementTool-AD
            {
                Ensure    = "Present"
                Name      = "RSAT-AD-Tools"
                DependsOn = "[WindowsFeature]ADDSInstall"
            }
            WindowsFeature RSAT-ManagementTool-DNS
            {
                Ensure    = "Present"
                Name      = "RSAT-DNS-Server"
                DependsOn = "[WindowsFeature]ADDSInstall"
            }
        }

        if($Node.Role -eq "Primary DC")
        {
            xADDomain PrimaryDC
            {
                DomainName                    = $Node.DomainName
                DomainAdministratorCredential = $DomainAdminCredential
                SafemodeAdministratorPassword = $LocalAdminCredential
                DependsOn                     = "[WindowsFeature]ADDSInstall"
            }

            xWaitForADDomain DscForestWait
            {
                DomainName           = $Node.DomainName
                DomainUserCredential = $DomainAdminCredential
                RetryCount           = 20
                RetryIntervalSec     = 30
                DependsOn            = "[xADDomain]PrimaryDC"
            }

            # Enable AD Recycle bin
            xADRecycleBin RecycleBin
            {
                EnterpriseAdministratorCredential = $DomainAdminCredential
                ForestFQDN                        = $Node.DomainName
                DependsOn                         = "[xWaitForADDomain]DscForestWait"
            }

            # Install a KDS Root Key so we can create MSA/gMSA accounts
            Script CreateKDSRootKey
            {
                SetScript = {
                    Add-KDSRootKey -EffectiveTime ((Get-Date).AddHours(-10))
                }
                GetScript = {
                    Return @{
                        KDSRootKey = (Get-KDSRootKey)
                    }
                }
                TestScript = {
                    If (-not (Get-KDSRootKey)) {
                        Write-Verbose -Message "KDS Root Key Needs to be installed..."
                        Return $False
                    }
                    Return $True
                }
                DependsOn = '[xWaitForADDomain]DscForestWait'
            }
        }
        else
        {

            xWaitForADDomain DscForestWait
            {
                DomainName           = $Node.DomainName
                DomainUserCredential = $DomainAdminCredential
                RetryCount           = 100
                RetryIntervalSec     = 10
                DependsOn            = "[WindowsFeature]ADDSInstall"
            }

            xADDomainController SecondaryDC
            {
                DomainName                    = $Node.DomainName
                DomainAdministratorCredential = $DomainAdminCredential
                SafemodeAdministratorPassword = $LocalAdminCredential
                DependsOn                     = "[xWaitForADDomain]DscForestWait"
            }
        }

        # DNS Server Settings
        if ($Node.Forwarders)
        {
            xDnsServerForwarder DNSForwarders
            {
                IsSingleInstance = 'Yes'
                IPAddresses      = $Node.Forwarders
                DependsOn        = "[xWaitForADDomain]DscForestWait"
            }
        }
    }
}
```

#### Initialisation

Vous trouverez ci-dessous un exemple de paramétrage vous permettant de lancer le processus de configuration de votre contrôleur de domaine.

```powershell
# Parameters
$Configs = @{
    AllNodes = @(
        @{
            NodeName                    = "localhost"
            DomainName                  = "netboot.lab"
            LocalAdminPassword          = "P@sswOrd!"
            DomainAdminPassword         = "P@sswOrd!"
            Role                        = "Primary DC"
            Forwarders                  = @('8.8.8.8','8.8.4.4')
            PsDscAllowPlainTextPassword = $True
            InstallRSATTools            = $True
        }
    )
}

# Create Mof configuration
SetupActiveDirectory -ConfigurationData $Configs

# Make sure that LCM is set to continue configuration after reboot
Set-DSCLocalConfigurationManager -Path .\SetupActiveDirectory –Verbose

# Build the domain
Start-DscConfiguration -Wait -Force -Path .\SetupActiveDirectory -Verbose
```

<div style="text-align: center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/SypPOgRgr38" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>


Dans le cadre d'une infrastructure de Production, je vous recommande de **crypter** les informations de connexion a l'aide de certificat (https://docs.microsoft.com/en-us/powershell/dsc/securemof).


## Source

- [Configuring the Local Configuration Manager](https://docs.microsoft.com/en-us/powershell/dsc/metaconfig)
- [Create the Key Distribution Services KDS Root Key](https://docs.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/create-the-key-distribution-services-kds-root-key)
- [Securing the MOF File](https://docs.microsoft.com/en-us/powershell/dsc/securemof)
- [Install-ADDSForest](https://docs.microsoft.com/en-us/powershell/module/addsdeployment/install-addsforest?view=win10-ps)
- [Enable-ADOptionalFeature](https://technet.microsoft.com/es-es/library/hh852249(v=wps.620).aspx)
