---
layout: post
date: 2018-03-16
title: "Forcer l’utilisation de TLS 1.2 pour Powershell"
header: /banner/powershell-banner-01.png
tags:
- securite
- powershell
- tls
categories:
  - powershell
---

Les années passent et le protocole **TLS** évolue. Nous en sommes aujourd’hui à la version **1.3** et de plus en plus de sites et API désactivent les versions plus anciennes. Malheureusement, si vous souhaitez interagir avec eux en **Powershell** (dans une version inférieure à la 6.0) avec des commandes comme **Invoke-RestMethod** ou **Invoke-WebRequest**, vous risquez de vous retrouver avec l’erreur Could not create SSL/TLS secure channel.

<!--more-->

```powershell
PS C:\Script> Invoke-RestMethod -Uri 'https://api.github.com' -Method 'Get'
Invoke-RestMethod : The request was aborted: Could not create SSL/TLS secure channel.
At line:1 char:1
+ Invoke-RestMethod -Uri 'https://api.github.com ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-RestMethod], WebException
    + FullyQualifiedErrorId : WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeRestMethodCommand
```

Par défaut ces commandes **Powershell** utilisent la version 1.0 de TLS. La solution de contournement est plutôt simple (à partir du moment où on la connait…). Soit vous sautez le pas et commencez à utiliser Powershell Core, soit il vous sera nécessaire de préciser au préalable quelle version vous souhaitez utiliser.

Les dernières releases de Powershell 5.X ne supportant pour l’instant que le TLS 1.2, il suffit de préciser cette version avec la commande suivante:

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```

Attention, la modification est prise en compte dans la session en cours, donc pensez bien à l’inclure à chaque exécution de vos scripts.