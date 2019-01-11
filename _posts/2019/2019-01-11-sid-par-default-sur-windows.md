---
layout: post
date: 2019-01-11
title: SID par défaut sur Windows
header: /banner/server-banner-01.png
tags:
  - windows
  - os
categories:
  - os
---

Au lieu d’utiliser des noms, le système d’exploitation Windows utilise des **SID** (**Security Identifiers**) pour identifier les entités effectuant des actions.

Ce sont des identifiants **uniques** et **immuables** de sécurité alphanumériques assignés par un contrôleur de domaine qui identifient chaque système, utilisateur ou objet (groupe) dans un réseau ou sur une machine. Certains SID sont identiques sur tous les systèmes.

La liste ci-dessous vous sera très pratique quand il vous manque les droits d’un utilisateur standard / par défaut, ou bien pour la création de scripts powershell.

## SID des comptes utilisateurs

| Compte Utilisateur | SID                |
| ------------------ | ------------------ |
| Administrator      | S-1-5-21domain-500 |
| Guest              | S-1-5-21domain-501 |
| KRBTGT             | S-1-5-21domain-502 |
| Creator Owner      | S-1-3-0            |
| Interactive        | S-1-5-4            |
| Anonymous          | S-1-5-7            |

## SID des groupes

| Groupe                                  | SID                |
| --------------------------------------- | ------------------ |
| Everyone                                | S-1-1-0            |
| Enterprise Domain Controllers           | S-1-5-9            |
| Authenticated Users                     | S-1-5-11           |
| Domain Admins                           | S-1-5-21domain-512 |
| Domain Users                            | S-1-5-21domain-513 |
| Domain Computers                        | S-1-5-21domain-515 |
| Domain Controllers                      | S-1-5-21domain-516 |
| Cert Publishers                         | S-1-5-21domain-517 |
| Schema Admins                           | S-1-5-21domain-518 |
| Enterprise Admins                       | S-1-5-21domain-519 |
| Group Policy Creator Owners             | S-1-5-21domain-520 |
| Administrators                          | S-1-5-32-544       |
| Users                                   | S-1-5-32-545       |
| Guests                                  | S-1-5-32-546       |
| Account Operators                       | S-1-5-32-548       |
| Server Operators                        | S-1-5-32-549       |
| Print Operators                         | S-1-5-32-550       |
| Backup Operators                        | S-1-5-32-551       |
| Replicators                             | S-1-5-32-552       |
| Pre-Windows 2000 Compatible Access      | S-1-5-32-554       |
| Remote Desktop Users                    | S-1-5-32-555       |
| Network Configuration Operators         | S-1-5-32-556       |
| Incoming Forest Trust Builders          | S-1-5-32-557       |
| Enterprise Read-only Domain Controllers | S-1-5-21domain-498 |
| Read-only Domain Controllers            | S-1-5-21domain-521 |
| Allowed RODC Password Replication Group | S-1-5-21domain-571 |
| Denied RODC Password Replication Group  | S-1-5-21domain-572 |
| Event Log Readers                       | S-1-5-32-573       |
