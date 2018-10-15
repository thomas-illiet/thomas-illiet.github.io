---
layout: post
date: 2017-01-10
title: DSC – Desired State Configuration
header: /banner/powershell-banner-01.png
tags:
  - powershell
  - powershell dsc
categories:
  - powershell dsc
---

Vous cherchez un moyen d’automatiser vos installations d’applications ou projets ? Vous en avez marre de répéter 50 fois les mêmes actions, et vous commencez à avoir des crampes aux doigts à force de configurer vos services applicatifs à la main ? DSC (Desired State Configuration) est fait pour vous ! Et cerise sur le gâteau, c’est du PowerShell !

Selon la Bible technet, DSC est « une plateforme de gestion en PowerShell ». « Il permet le déploiement et la gestion des données de configuration pour les services et l’environnement sur lequel ces services doivent s’exécuter. ».

<!--more-->

DSC dispose de deux modes de fonctionnement : Push et Pull. Le premier consiste à « pousser » ponctuellement une configuration sur un ou plusieurs serveurs. Le Pull repose sur un service web qui va être consommé par des machines afin de s’assurer qu’elles sont dans l’état de configuration attendu, et appliquer cette configuration le cas échéant.

## Description & fonctionnalités

DSC est une nouvelle plateforme de gestion de Windows PowerShell qui permet de déployer et gérer les données de configuration des services logiciels, et de gérer l’environnement dans lequel ces services s’exécutent.

Elle réunit trois composants principaux :

* Les configurations sont des scripts PowerShell déclaratifs qui définissent et configurent des instances de ressources.
  * Les configurations DSC sont également idempotent, c’est-à-dire que le Gestionnaire de configuration local (ou « LCM ») s’assure en permanence que les machines restent configurées dans l’état déclaré dans la configuration.
* Les ressources sont les blocs de construction impératifs de DSC qui sont créés pour modéliser les divers composants d’un sous-système et implémenter le flux de contrôle de leurs différents états.
* Le LCM est le moteur utilisé par DSC pour faciliter les interactions entre les ressources et les configurations. Le LCM interroge régulièrement le système, via le flux de contrôle implémenté par les ressources, pour s’assurer que le système est dans l’état déclaré dans une configuration. Si le système n’est pas dans l’état souhaité, le LCM utilise une logique supplémentaire à l’intérieur des ressources pour « faire en sorte » qu’il soit conforme à l’état déclaré dans la configuration.

## Configuration DSC

Un script de configuration comprend les éléments suivants :

* Le bloc Configuration. Il s’agit du bloc de script le plus externe. Pour le définir, utilisez le mot clé Configuration, puis attribuez-lui un nom. Ici, le nom de la configuration est « MyDscConfiguration ».
* Un ou plusieurs blocs Node. Ils définissent les nœuds (ordinateurs ou machines virtuelles) que vous configurez.
* Un ou plusieurs blocs de ressources. C’est là que la configuration définit les propriétés pour les ressources qu’elle configure. Ici, nous avons deux blocs de ressources qui appellent tous les deux la ressource « WindowsFeature ».

Exemple de configuration :

```powershell
 Configuration MyDscConfiguration {

    [string[]]$ComputerName= "localhost"

    Node $ComputerName{
        WindowsFeature MyFeatureInstance {
            Ensure = "Present"
            Name = “DNS"
        }
        WindowsFeature My2ndFeatureInstance {
            Ensure = "Present"
            Name = "Bitlocker"
        }
    }
}
MyDscConfiguration
```

## Compilation de la configuration

Avant de pouvoir promulguer une configuration, vous devez la compiler dans un document **MOF** (Meta-Object-Facility).

Quand vous appelez la configuration, elle :

* Crée un dossier dans le répertoire actif portant le même nom que la configuration.
* Crée un fichier nommé nom_nœud.mof dans le nouveau répertoire, où nom_nœud correspond au nom du nœud cible de la configuration. S’il existe plusieurs nœuds, un fichier MOF est créé pour chaque nœud.

## Ressources DSC

La force de **PowerShell DSC** réside dans les modules qui le composent. On dispose déjà de certaines ressources **DSC** par défaut (e.g. **File** pour faire une simple copie de fichier, ou encore **WindowsFeature** pour rajouter des rôles / fonctionnalités à un serveur).

En plus de cela, vous avez la possibilité de créer des ressources DSC personnalisées ainsi qu’une vaste communauté portée par l’équipe **PowerShell Microsoft** : https://github.com/PowerShell

Une ressource peut modéliser un élément générique comme un fichier ou spécifique comme un paramètre de serveur IIS. Les groupes de ce type de ressources sont combinés dans un module DSC qui organise tous les fichiers nécessaires dans une structure portable incluant les métadonnées permettant d’identifier la façon dont sont utilisées les ressources.

### Ressources DSC intégrées

| Ressources     | Description                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| Archive        | Gestion des fichiers .zip                                                     |
| Environnement  | Gestion des variables d’environnement système                                |
| File           | Gestion des fichiers et des dossiers                                          |
| Group          | Mécanisme de gestion des groupes locaux                                       |
| Log            | Gestion des logs                                                              |
| Package        | Gestion du mécanisme d’installation / désinstallation de pacakges (ex : msi) |
| Registry       | Gestion des clés et des valeurs de la base de registre                        |
| Script         | Gestion d’exécution de script et des codes retours                           |
| Service        | Mécanisme de gestion des services windows                                     |
| User           | Gestion des comptes utilisateurs locaux                                       |
| WindowsFeature | Gestion des rôles et fonctionnalités de serveur                               |
| WindowsProcess | Gestion des I/O                                                               |

## Gestionnaire de configuration locale

Le **Gestionnaire de configuration local** (ou « LCM ») est le moteur de la fonctionnalité DSC (Desired State Configuration) de Windows PowerShell. Le LCM s’exécute sur chaque noeud cible pour analyser et appliquer les configurations transmises au nœud. Il a également en charge plusieurs autres opérations liées à DSC, notamment les suivantes.

* Déterminer le mode d’actualisation (push ou pull).
* Spécifier la fréquence à laquelle un nœud extrait et applique les configurations.
* Associer le noeud à des serveurs collecteurs.
* Spécifier des configurations partielles.

Un type spécial de configuration vous permet de configurer le **LCM** pour définir chacun de ces comportements. Les sections qui suivent décrivent comment configurer le LCM.

Appelez et exécutez la configuration pour créer le fichier MOF de configuration, comme pour une configuration standard. À la différence d’une configuration standard, vous n’appliquez pas de configuration du gestionnaire de configuration local en appelant l’applet de commande ```Start-DscConfiguration```. Appelez plutôt l’applet de commande ```Set-DscLocalConfigurationManager``` en spécifiant le chemin du fichier MOF de configuration comme paramètre. Après avoir appliqué la configuration, vous pouvez afficher les propriétés du gestionnaire de configuration local en appelant l’applet de commande ```Get-DscLocalConfigurationManager```.

Une configuration du **LCM** peut contenir des blocs pour un ensemble limité de ressources uniquement. Dans l’exemple précédent, Settings est la seule ressource appelée. Voici les autres ressources disponibles :

* **ConfigurationRepositoryWeb** : spécifie un serveur collecteur **HTTP** pour les configurations.
* **ConfigurationRepositoryShare** : spécifie un serveur collecteur **SMB** pour les configurations.
* **ResourceRepositoryWeb** : spécifie un serveur collecteur **HTTP** pour les modules.
* **ResourceRepositoryShare** : spécifie un serveur collecteur **SMB** pour les modules.
* **ReportServerWeb** : spécifie un serveur collecteur **HTTP** auquel les rapports sont envoyés.
* **PartialConfiguration** : spécifie des configurations partielles.
