---
layout: post
date: 2017-11-28
title: Introduction à l'API Graph de Microsoft
header: /banner/api-banner-01.png
tags:
- office365
- powershell
categories:
- powershell
---

Microsoft Graph permet de se connecter à de nombreuses ressources liées à Office 365 (utilisateurs, discussions, calendriers, groupes, etc.)

La dénomination « **Graph** » vient du fait que toutes ces ressources sont **interconnectées**, formant un réseau d’objets.

Par exemple, pour un utilisateur donné, Graph permet d’accéder à ses messages, son **calendrier**, ses **fichiers**, mais également aux **groupes** auxquels il appartient. Cet utilisateur est également associé à un **manager**, à un ou plusieurs appareils (PC, téléphone, etc.), et d’autres choses encore…

<!--more-->

Ces interconnexions permettent d’imaginer beaucoup de scénarii d’utilisation. Voici un exemple de représentation d'interconnexion entre les différentes zones :
![graphapi-01](/assets/img/2017/office365/graphapi-01.png#center)

À partir du principal point de terminaison (https://graph.microsoft.com), nous pouvons appeler n'importe quelle ressource disponible dont vous avez les autorisations. Cette URL se décompose en deux parties:

- Version de la méthode
- Nom de la Methode

Dans le tableau suivant, vous trouverez quelques exemples de points de terminaison :

| Opération                               | Points de terminaison                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| Tous les utilisateurs de l'organisation | https://graph.microsoft.com/v1.0/users                                               |
| Répertorier les salles de conférences   | https://graph.microsoft.com/beta/me/findRooms                                        |
| Tous les Groupes de mon organisation    | https://graph.microsoft.com/v1.0/groups                                              |
| Membre du groupe                        | https://graph.microsoft.com/v1.0/groups/02bd9fd6-8f93-4758-87c3-1fb73740a315/members |
| Mes contacts                            | https://graph.microsoft.com/v1.0/me/contacts                                         |

Sachez que sur son site, Microsoft fournit toute une liste d’exemples permettant d’illustrer le potentiel de Graph, vous pouvez trouver plus d'information concernant ces utilisations à l'adresse suivante : https://developer.microsoft.com/en-us/graph/docs/concepts

## Authentification

### OAuth

OAuth est un protocole libre qui permet d'autoriser une application client à utiliser l'API sécurisée d'une autre application pour le compte d'un utilisateur.

L'intérêt majeur d'OAuth vient du fait que l'utilisateur n'a plus besoin de fournir ses informations d’identification à une application tierce, car la connexion se passe sur l’application de l'API.

Pour cette **recette** nous utiliserons OAuth pour fournir une authentification à notre Script/Module Powershell afin de pouvoir exécuter différentes actions d'administrations.

Ci-dessous un résumé des flux du protocole OAuth, ce qui vous permettra de mieux comprendre le scénario d'authentification & d'utilisation :

![graphapi-09](/assets/img/2017/office365/graphapi-09.jpg#center)

Pour plus d'information, je vous redirige vers la documentation officiel : https://oauth.net/getting-started

### Application

Pour pouvoir mettre en oeuvre la suite de cette recette nous allons devoir effectuer la création d'une application **Azure Active Directory**, ce qui permettra à nos scripts d'être authentifiés via OAuth sur notre Tenant Office365.

Se connecter en tant qu’administrateur de son abonnement Azure (*ou un compte avec des privilèges suffisants sur l’Azure Active Directory*) sur le portail de gestion : https://portal.azure.com

La suite des opérations va consister à créer des *credentials*, c’est-à-dire les informations nécessaires à l’application OAuth2 pour s’authentifier auprès d’un abonnement Azure et y faire des opérations.

Cela nécessite de créer une application dans Azure Active Directory pour générer le **client-id** et le **client-secret**.

Aller dans la partie Azure Active Directory, sélectionner l’Azure Active Directory concerné et cliquer sur **App registrations**

![graphapi-02](/assets/img/2017/office365/graphapi-02.png#center)

Puis cliquer sur **Endpoints**.

Sur la ligne **OAUTH 2.0 AUTHORIZATION ENDPOINT**, récupérer le **GUID** dans l’URL proposée. Cette valeur sera le **Tenant-id**.

![graphapi-03](/assets/img/2017/office365/graphapi-03.png#center)

Fermer la lame et cliquer sur **Add**… pour enregistrer une nouvelle application auprès d’Azure Active Directory.

Donner un nom et une URL de Callback quelconque (car non utile dans notre situation) et sélectionner **Web app / API** dans la zone Application Type, enfin cliquer sur **Create**.

![graphapi-04](/assets/img/2017/office365/graphapi-04.png#center)

Cliquer ensuite sur l’application qui vient d’être enregistrée, sur cette interface sera affichée votre application ID correspondant à la valeur **client-id**.

![graphapi-05](/assets/img/2017/office365/graphapi-05.png#center)

La suite des opérations consiste à créer une nouvelle clé pour cette application.

Saisir une description et choisir une expiration (1 an, 2 ans ou pas d’expiration).

![graphapi-06](/assets/img/2017/office365/graphapi-06.png#center)

Cliquer sur **Save**.

L’interface va alors dévoiler un secret qui ne sera exposé qu’une seule fois (penser à faire un copier-coller avant de fermer la lame). Ce secret est la valeur **client-secret**.

!!! danger
    Attention, après avoir fermé la lame, la valeur de la clé ne sera pas récupérable.
    En cas de perte vous devrez donc recréer une nouvelle clef 😓

![graphapi-07](/assets/img/2017/office365/graphapi-07.png#center)

La définition des autorisations se fait à l'aide du menu **Required permissions** dans les propriétés de votre application. Pour connaitre les permissions à accorder je vous invite à vous référer à la documentation de la méthode que vous souhaiter exécuter.

![graphapi-08](/assets/img/2017/office365/graphapi-08.png#center)

Dans l'exemple ci-dessus, j'ai fourni bien **trop** d'autorisations a mon application, je vous recommande vivement de fournir uniquement les accès que vous avez besoin.

## Exemple de script

### Token

Cette simple fonction Powershell vous permettra d'effectuer une demande d'authentification auprès du Graph API, ce qui vous permettra par la suite de pouvoir exécuter des requêtes authentifiées.

``` powershell
function Get-OauthToken()
{
    Param(
        [String]$ClientID,
        [String]$ClientSecret,
        [String]$TenantID,
        [String]$Scope="https://graph.microsoft.com/.default",
        [String]$LoginURL="https://login.microsoftonline.com"
    )
    Try {
        # Get an Oauth2 access token based on client id, secret and tenant domain
        $body       = @{grant_type="client_credentials";client_id=$ClientID;client_secret=$ClientSecret;scope=$Scope}
        $oauth      = Invoke-RestMethod -Method Post -Uri "$LoginURL/$TenantID/oauth2/v2.0/token" -Body $body

        if ($oauth.access_token -ne $null) {
            return $oauth
        } else {
            Throw [System.NotImplementedException]::New("Unable to find token : $oauth")
        }
    } Catch {
        Throw [System.NotImplementedException]::New("Unable to get token : $_")
    }
}

$Params = @{
    ClientID     = "0a658d35-XXXX-XXXX-XXXX-91b2679a8e7f"
    ClientSecret = "VnA4URRcZGZZr6GrFvmz1xIwIHSOP/DUBBU="
    TenantID     = "d6eaade4-XXXX-XXXX-XXXX-f000827455bb"
}
$Token = Get-OauthToken @Params
```

### Utilisateurs

La fonction suivante vous permettra de récupérer tous les utilisateurs de votre tenant Office365.

``` powershell
function Get-PGUsers {
    Param (
        [Object]$Token
    )
    Try {
        if($Token.access_token -ne $null) {

            # Get User Calandars
            $headerParams = @{'Authorization'="$($Token.token_type) $($Token.access_token)"}
            $url = "https://graph.microsoft.com/v1.0/users"

            $request = Invoke-WebRequest -UseBasicParsing -Headers $headerParams -Uri $url -Method Get

            $calendars = ($request | ConvertFrom-Json).value
            return $calendars
        } else {
            return $false
        }
    } Catch {
        Throw [System.NotImplementedException]::New("Unable to user calandars : $_")
    }
}
Get-PGUsers -Token $token
```

### Templatisation

C'est bien sympa de faire des fonctions monolithiques, mais c'est ce n'est pas très évolutif 😅, je vous propose donc une alternative dynamique :


``` powershell
function Get-PGRow {
    Param (
        [String]$Version,
        [String]$Method,
        [Object]$Token
    )
    Try {
        if($Token.access_token -ne $null) {

            $headerParams = @{'Authorization'="$($Token.token_type) $($Token.access_token)"}
            $url = "https://graph.microsoft.com/$Version/$Method"

            $request = Invoke-WebRequest -UseBasicParsing -Headers $headerParams -Uri $url -Method Get

            $responce = ($request | ConvertFrom-Json).value
            return $responce
        } else {
            return $false
        }
    } Catch {
        Throw [System.NotImplementedException]::New("Unable to $Method : $_")
    }
}

# Get Users
$Params = @{
    Version = "V1.0"
    Method  = "users"
    Token   = $Token
}
$Users = Get-PGRow @Params

# Get my mail
$Params = @{
    Version = "V1.0"
    Method  = "/users/contact@unicorn.microsoft.com/messages"
    Token   = $Token
}
$MyMessage = Get-PGRow @Params
```

Vous remarquerez rapidement qu'avec l'exemple ci-dessus  nous ne pouvons pas récupérer tous les mails du compte. Il vous faudra donc utiliser une autre fonction pour prendre en charge les requêtes comportant plusieurs pages.

Voici donc la fonction qui vous permettra de résoudre cette problématique :

``` powershell
function Get-PGAll {
    Param (
        [String]$Version,
        [String]$Method,
        [Object]$Token
    )
    Try {

        # Params
        $headerParams = @{'Authorization'="$($Token.token_type) $($Token.access_token)"}
        $url = "https://graph.microsoft.com/$Version/$Method"
        $ReturnObject = @()

        # loop through each query page (1 through n)
        Do{
            # display each url on the console window
            Write-debug "Fetching data using Uri: $url"

            # Request to API Graph
            $Request = (Invoke-WebRequest -UseBasicParsing -Headers $headerParams -Uri $url -Method Get | ConvertFrom-Json)

            $ReturnObject += $Request.value
            $url = $Request.'@odata.nextLink'

        } while(-not([string]::IsNullOrEmpty($url)))

        # Return Object
        return $ReturnObject

    } Catch {
        Throw [System.NotImplementedException]::New("Unable to get API : $_")
    }
}

# Get users delta
$Params = @{
    Version = "V1.0"
    Method  = "/users/delta"
    Token   = $Token
}
$UsersDelta = Get-PGAll @Params
```

Vous connaissez désormais les bases de Microsoft Graph. L’API étant perpétuellement en mouvement, de nouveaux scénarii d’utilisation apparaîtront probablement dans un futur proche pour exploiter pleinement le potentiel d’Office 365.

## Note du Chef

Microsoft vous propose une plateforme  permettant d'explorer les APIs graph sans trop de prise de tête, disponible à l'adresse suivante : https://developer.microsoft.com/en-us/graph/graph-explorer

Je vous souhaite maintenant une bonne exploration de l'univers des APIs Microsoft.
![graphapi-10](/assets/img/2017/office365/graphapi-10.gif#banner)