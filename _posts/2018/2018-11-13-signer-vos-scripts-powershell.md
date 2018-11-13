---
layout: post
date: 2018-11-13
title: Signer vos scripts Powershell
header: /banner/powershell-banner-01.png
tags:
  - powershell
categories:
  - powershell
---

Je vous propose aujourd'hui de signer vos scripts Powershell avec un certificat de type Class **3 code-signing**, ce qui va augmenter la sécurité sur deux axes majeurs :

* **L’authentification :** Les personnes qui utiliseront vos scripts seront certaines que ce script a bien été créé par vous.
* **L’intégrité :** les personnes qui utiliseront vos scripts seront certaines que celui-ci n’a pas été modifié puisqu’il est signé.

<!--more-->

## Exécution policies

Comme vous le savez sûrement, PowerShell dispose de certaines protections contre l’utilisation des scripts.
Pour commencer, par défaut l’extension .ps1 est associé a Notepad. Ceci afin de prévenir les utilisateurs d’une utilisation d’un script par simple double clic.

Ensuite, en fonction de votre système d’exploitation, l’exécution policy est limité par défaut :

* Windows 8.1, 10 et Server 2012 **(Restricted execution policy)**
* Windows 2012 R2 et 2016 **(RemoteSigned execution policy)**

Il est bien évidemment possible de changer votre execution policy avec la commande PowerShell Set-ExecutionPolicy ou par Group Policy.

Voici les différents modes existants :


* **Restricted** : Cette politique interdit tout simplement l’exécution de n’importe quel script. Elle peut être appliquée dans le cas où vous ne feriez pas du tout de Powershell ou dans les environnements plus sensibles.
* **AllSigned** : Autorise l’exécution des scripts signés par un éditeur approuvé (ce que nous verrons juste après).
* **RemoteSigned** : Les scripts téléchargés doivent être signés par un éditeur approuvé avant leur exécution.
* **Unrestricted** : **(le mal)** Cette politique autorise l’exécution de tous les scripts Powershell, peu importe leur provenance. Ce mode représente une faille de sécurité non négligeable et n’est conseillé qu’en environnement de test.


Il est également possible de limiter la portée de cette policy

* **Process** : Uniquement pour la session PowerShell en cours
* **CurrentUser** : Uniquement pour l’utilisateur qui lance la commande
* **LocalMachine** : Pour tous les utilisateurs du poste

Par exemple, avec la commande suivante je vais autoriser de façon temporaire l’utilisation de n’importe quel script :

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Powershell est un outil très puissant, et peut être dévastateur si un script malveillant est lancé sur votre infrastructure. Laisser la Politique d’exécution de script en **Unrestricted** n’est absolument pas recommandé.

Mais alors que faire ? Placer votre politique d’exécution en **AllSigned** et signer vous-même vos scripts semblent être la meilleure solution.

## Obtenir un certificat

Comment obtenir un certificat ? plusieurs facteurs sont à prendre en compte:

* Qui va utiliser le script ? Si l’utilisation se limite à votre société vous n’aurez pas les mêmes contraintes vis-à-vis d’une utilisation publique
* Disposez vous d’une autorité interne ?
* Étés vous prêt à investir de l’argent ?
* S’agit-il juste d’un test/démo ?

Pour vos environnements de test/demo nous allons créer un certificat autosigné. Pour cela la commande powershell **New-SelfSignedCertificate** peut être utilisée

## Mise en place

Tout d’abord vous devez lancer une console PowerShell avec des droits d’administrateur.

Puis créer votre certificat avec la commande PowerShell suivante :

```powershell
$Params = @{
    Type = "Custom"
    Subject = "CN=Thomas ILLIET"
    TextExtension =  @("2.5.29.37={text}1.3.6.1.5.5.7.3.3","2.5.29.17={text}email=contact@thomas-illiet.fr&upn=contact@thomas-illiet.fr")
    KeyUsage = "DigitalSignature"
    KeyAlgorithm = "RSA"
    KeyLength = 2048
    CertStoreLocation = "Cert:\CurrentUser\My"
}
New-SelfSignedCertificate @Params
```

Maintenant que nous avons notre certificat il ne reste plus cas l’ajouter à nos scripts.

Pour cela il faut tout d’abord sélectionner votre certificat

```powershell
$cert = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert | Where-Object Subject -eq "CN=Thomas ILLIET"
```

Ensuite il faut utiliser la commande Set-AuthenticodeSignature sur votre script:

```powershell
Set-AuthenticodeSignature -FilePath '.\script.ps1' -Certificate $cert
```

Et voilà le résultat :

```powershell
# SIG # Begin signature block
# MIIFuAYJKoZIhvcNAQcCoIIFqTCCBaUCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQU/62FZHHo7tNqDr9qiuoqQjQb
# IoagggNVMIIDUTCCAjmgAwIBAgIQJc6A6gK+nYJFt+hgcK7fbTANBgkqhkiG9w0B
# AQsFADAYMRYwFAYDVQQDDA1UaG9tYXMgSUxMSUVUMB4XDTE4MTExMzE5NDIxMloX
# DTE5MTExMzIwMDIxMlowGDEWMBQGA1UEAwwNVGhvbWFzIElMTElFVDCCASIwDQYJ
# KoZIhvcNAQEBBQADggEPADCCAQoCggEBAM8exIjWDaMKglUtmpOkj8ceD5SeLzMd
# n4AHSOoWFTj1GAS0EjRnB74T45tc9n2QMWugZd7WEdQowTJJDxP6nJVGLJ3AjZwf
# 9pNWmjYVcxYTamcdaUcQlq5IEfKz9pEcrG043uX0OVnO+M/VX6ST5P7wqU4/suu7
# TWDzW7HmuFRwc5ZhLrhOpGB0gMq5EbEOi3vQlU/Amx48CKBgndiWnBTUfOqoLy2a
# CYN1wF1y02cjgarHV+UKmsmVGM9DrA0ipPHd+oeBKrRf/vf/RK0XDFrI+SPyGOH4
# qL/5IjLgeJFehq7/+6zdsFwUExh1AzRScmRF9N4kUvY3qHTPs3oyzr0CAwEAAaOB
# ljCBkzAOBgNVHQ8BAf8EBAMCB4AwEwYDVR0lBAwwCgYIKwYBBQUHAwMwTQYDVR0R
# BEYwRIEYY29udGFjdEB0aG9tYXMtaWxsaWV0LmZyoCgGCisGAQQBgjcUAgOgGgwY
# Y29udGFjdEB0aG9tYXMtaWxsaWV0LmZyMB0GA1UdDgQWBBQMJC3LgpsAUsZ9eLpA
# 5Q6rcupOoTANBgkqhkiG9w0BAQsFAAOCAQEAVIkVuS7qmk2ExUFlkg9deM0yGSsH
# 9mutLYLlmCUnRT4aeEUc2+t1hC5U67lX75rvOetqZ2HcEvbanKwKDlHQ5cfuKQGa
# ep36a1SERiNR4hFO07SetpGUXG4v1xHxIHFIDibj6CSvyzNaPi0iXCbWQMWMnqiw
# d5TE6AZE/DY+NsXVJS0N9ydbBgaBngOXLp3qSQa4R+E2JtTaIs730JP3OYIG9I+Z
# qj7oV2J2t6fjktCD+Nv0CTFUKwvEjv2wDP+tu2jCM0NMobOED5teyRCF8kZt8Oyz
# pxnMabSggFAM2QBkpPyK8L+7mULSviNL9PYFiS3hLJ5YVt3qGyvEzD0mSTGCAc0w
# ggHJAgEBMCwwGDEWMBQGA1UEAwwNVGhvbWFzIElMTElFVAIQJc6A6gK+nYJFt+hg
# cK7fbTAJBgUrDgMCGgUAoHgwGAYKKwYBBAGCNwIBDDEKMAigAoAAoQKAADAZBgkq
# hkiG9w0BCQMxDAYKKwYBBAGCNwIBBDAcBgorBgEEAYI3AgELMQ4wDAYKKwYBBAGC
# NwIBFTAjBgkqhkiG9w0BCQQxFgQUQSeibYmhuXuVYsbNPh4O2+imUgowDQYJKoZI
# hvcNAQEBBQAEggEAZ8C8aQODQcJWhwgHUONCD11HvCBeMXI0Mpz6EpYyf4bNoz83
# HQ29alJE12jgqZ2Qu42/q6LoVAjz2v9NIM7VxIOYn05ML9wxXPAmBbOS0KfWEPmb
# 18eQD7t/oG5odVGlc8WTCiGybhCw1HQQiohysQ0K6vrZk4ycNN//QH219XdRe97r
# U16PNK3wfttLrQBTApstK6kLYAW9cApWyLCXItmUM12yWlv/GyN2BLxl7dbzmgJ3
# skEVj1BAZFmpNAViFyHVjLLLTIgAHtfjvOFSVg1IjawaKrOCI+YgRJUVodZDJ5PT
# RQrpYEdtXa7d4bB27a0NhYA51cXdPpAdENBptQ==
# SIG # End signature block
```

Vous voila maintenant avec un script signé 🏆

Enjoy ! 🙂