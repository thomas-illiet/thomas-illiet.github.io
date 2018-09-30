---
layout: post
date: 2017-10-13
title: Personnaliser votre console Powershell
header: /banner/powershell-banner-01.png
tags:
- powershell
categories:
- powershell
---

Powershell vous permet de **personnaliser** votre console de différentes façons,vous pouvez modifier la police, la taille de la police, les couleurs, l'arrière-plan, la taille et la disposition des fenêtres et bien d'autres choses...

Dans cette recette nous allons voir ensemble la personnalisation de l'**interface** & de la **console**.

<!--more-->

## Interface

* Allez dans Démarrer & cliquez sur **Powershell** pour lancer la console.
* Une fois la console ouverte, effectuer un clic droit sur la **barre de titre** de la console.
* Un menu apparaîtra, sélectionnez **Propriétés**.

![customize-console-01](/assets/img/2017/powershell/customize-console-01.png)

Dans ce premier onglet **'Options'**, vous pouvez modifier la taille de votre curseur

![customize-console-02](/assets/img/2017/powershell/customize-console-02.png)

Dans l'onglet suivant **'Font'**, vous pouvez personnaliser la taille & la police d'écriture

![customize-console-03](/assets/img/2017/powershell/customize-console-03.png)

Dans l'onglet **'Layout'**, vous allez pouvoir personnaliser la taille de la fenêtre de la console.

![customize-console-04](/assets/img/2017/powershell/customize-console-04.png)

Ce dernier onglet **'Colors'**, vous donne des options pour changer la couleur du texte et de l'arrière-plan.

![customize-console-05](/assets/img/2017/powershell/customize-console-05.png)

## Console

Ici nous effectuerons la personnalisation de la console Powershell via le fichier de configuration de ce dernier.

### Préparation

Pour créez votre profil powershell executer le **script** suivant dans votre console Powershell, ce qui permettra de créer le fichier de profil s’il n'existe pas encore.

``` powershell
if((Test-path $Profile) -eq $false) {
    write-host "Create windows Powershell profile"
    New-Item -path $Profile -type file –force | out-null
}
Notepad $Profile
```

### Conception

Pour l'exemple voici le profil powershell que j'utilise sur mes ordinateurs, après libre a vous de le modifier en fonction de vos besoins.

Il ajoute les fonctionnalités suivantes :

* Affichage des informations d'environnement :
  * Adresse IP
  * Nom de l'ordinateur
  * Nom d'utilisateur
  * Version de Powershell
* Changement de répertoire automatique
* Mise à jour du Help
* Affichage du Help d'une cmdlet aléatoire
* Changement du Prompt

``` powershell
# ++++++++++++++++++++++++++++++++++
# Window, Path and Help

# Set windows prompt
function Get-Time {return $(Get-Date | ForEach {$_.ToLongTimeString()})}
function prompt {
    Write-Host "[" -noNewLine
    Write-Host $(Get-Time) -ForegroundColor DarkYellow -noNewLine
    Write-Host "] " -noNewLine
    Write-Host $($(Get-Location).Path.replace($home,"~")) -ForegroundColor DarkGreen -noNewLine
    Write-Host $(if ($nestedpromptlevel -ge 1) { '>>' }) -noNewLine
    return "> "
}

# Set the Path
$Profile_ScriptFolder = "C:\Script"
if(Test-Path $Profile_ScriptFolder) {
    Set-Location -Path $Profile_ScriptFolder
}

# Show GUI
$IPAddress=@(Get-WmiObject Win32_NetworkAdapterConfiguration | Where-Object {$_.DefaultIpGateway})[0].IPAddress[0]
$PSVersion=($host | Select-Object -ExpandProperty Version) -replace '^.+@\s'

Write-Host "# ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++" -ForegroundColor Yellow
Write-Host "# + " -ForegroundColor Yellow -nonewline; Write-Host "++++++++++"
Write-Host "# + " -ForegroundColor Yellow -nonewline; Write-Host "++  ++++++`tHi $($env:UserName)!"
Write-Host "# + " -ForegroundColor Yellow -nonewline; Write-Host "+++  +++++"
Write-Host "# + " -ForegroundColor Yellow -nonewline; Write-Host "++++  ++++`tComputerName`t`t" -nonewline; Write-Host $($env:COMPUTERNAME)
Write-Host "# + " -ForegroundColor Yellow -nonewline; Write-Host "++++  ++++`tIP Address`t`t" -nonewline; Write-Host $IPAddress
Write-Host "# + " -ForegroundColor Yellow -nonewline; Write-Host "+++  +++++`tUserName`t`t" -nonewline; Write-Host $env:UserDomain\$env:UserName
Write-Host "# + " -ForegroundColor Yellow -nonewline; Write-Host "++      ++`tPowerShell `t`t" -nonewline; Write-Host $PSVersion
Write-Host "# + " -ForegroundColor Yellow -nonewline; Write-Host "++++++++++"
Write-Host "# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`n" -ForegroundColor Yello

# Refresh Help
Start-Job -Name "UpdateHelp" -ScriptBlock { Update-Help -Force } | Out-null
Write-Host "Updating Help in background (Get-Help to check)" -ForegroundColor 'DarkGray'

# ++++++++++++++++++++++++++++++++++
# Other
# ++++++++++++++++++++++++++++++++++

# Learn something today (show a random cmdlet help and "about" article
Get-Command -Module Microsoft*,Cim*,PS*,ISE | Get-Random | Get-Help -ShowWindow
```

Ce qui donne une fois configurer le résultat suivant :
![customize-console-06](//assets/img/2017/powershell/customize-console-06.png#center)

En plus de la personnalisation de la console j'affichage le **Help** d'une cmdlet aléatoire, ce qui permet d'effectuer un apprentissage **passif** des commandes Powershell existantes.

## Note du chef

Pour allez plus loin, vous avez le Logiciel **ConEmu** qui est un émulateur de console qui ne se substitut pas a la console Powershell, mais qui **l’encapsule** pour lui ajouter quelques fonctionnalités bien pratiques.

* Ouverture de **plusieurs** shell dans des onglets
* Sélection de texte en appuyant simplement sur la touche Shift
* Collage du contenu du presse-papier en cliquant avec le bouton droit de la souris.
* Redimensionnement de la fenêtre **dynamique**
* **Anti-aliasing** (lissage) des polices de caractère
* Mode fullscreen
* … (et la liste est très longue)

![customize-console-07](/assets/img/2017/powershell/customize-console-07.png#center)