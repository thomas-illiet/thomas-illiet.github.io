---
layout: post
date: 2017-02-18
title: Présentation des disques durs de différenciation
header: /banner/server-banner-01.png
tags:
- hyper-v
categories:
- hyper-v
---

Un disque de différenciation est un disque basé sur un autre disque virtuel parent de taille fix ou dynamique. Le disque parent est le point de référence, toutes les données créées ou modifiées sont stockées sur le disque de différenciation. Cela permet d’économiser de la place et présente un intérêt particularité pour les maquettes ou les projets de développement.

<!--more-->

Voici une représentation graphique afin de mieux comprendre le fonctionnement des disques durs de différenciation :

![differencing-disks-12](/assets/img/2017/hyper-v/differencing-disks-12.png)

## Création de la base

On commence par créer une VM sur laquelle on installe notre système d’exploitation. Je nom cette VM BASE-SRV2K12R2 et j’y installe Windows Serveur 2012 R2.

Une fois le système d’exploitation installé il faut faire un sysprep. (Attention si vous voulez  ou faire un sysprep sur un système dit « client », il faut supprimer les comptes utilisateurs)

Pour cela, il faut se rendre C:\Windows\System32\Sysprep et exécuter sysprep.exe

Il faut cocher la case généralise ce qui permet de supprimer en autre le SID.

![differencing-disks-01](/assets/img/2017/hyper-v/differencing-disks-01.png)

## Création du disque de différenciation

On passe maintenant à la création du disque de différenciation.

Dans le gestionnaire Hyper-v, cliquer sur nouveau à Disque dur…

![differencing-disks-02](/assets/img/2017/hyper-v/differencing-disks-02.png)

Ensuite on sélectionne le type de disque

![differencing-disks-03](/assets/img/2017/hyper-v/differencing-disks-03.png)

et on sélectionne Différenciation

![differencing-disks-04](/assets/img/2017/hyper-v/differencing-disks-04.png)

Nous donnons un nom et un emplacement au disque de différenciation

![differencing-disks-05](/assets/img/2017/hyper-v/differencing-disks-05.png)

Il faut spécifier le VHD(X) à utiliser

![differencing-disks-06](/assets/img/2017/hyper-v/differencing-disks-06.png)
![differencing-disks-07](/assets/img/2017/hyper-v/differencing-disks-07.png)

Il faut supprimer la VM (pas le VHD(X)) pour éviter de démarrer et écrire sur la VM de BASE

![differencing-disks-08](/assets/img/2017/hyper-v/differencing-disks-08.png)

et on recréer une nouvelle VM

![differencing-disks-09](/assets/img/2017/hyper-v/differencing-disks-09.png)

au moment de créer le VHD(X) on coche Utiliser un disque dur virtuel existant / Parcourir… et on sélectionne le VHD(X) dupliqué au paravent

![differencing-disks-10](/assets/img/2017/hyper-v/differencing-disks-10.png)

a noter la taille que fait le VHDX

![differencing-disks-11](/assets/img/2017/hyper-v/differencing-disks-11.png)

Attention: Évitez d’utiliser des disques de différenciation sur les machines virtuelles qui s’exécutent des charges de travail de serveur dans un environnement de production