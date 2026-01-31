# 1. Tâches de conception / analyse (A)
## A1 – Analyse du parcours utilisateur non authentifié

Un utilisateur non authentifié peut uniquement accéder aux pages publiques de l’application.

### Accès à l’inscription

- L’utilisateur peut accéder à la page d’inscription depuis la page de connexion.

- Cette page permet de saisir les informations nécessaires à la création d’un compte.

### Accès à la connexion

- La page de connexion constitue le point d’entrée principal de l’application.

- Elle est accessible à tout utilisateur non authentifié.

### Restrictions d’accès

- Toute tentative d’accès à une page protégée (tableau de bord, détail d’une demande, etc.) est refusée.

- L’utilisateur est redirigé vers la page de connexion.

## A2 – Analyse du parcours utilisateur authentifié

Un utilisateur authentifié a accès aux fonctionnalités liées à la gestion de ses demandes.

### Accès au tableau de bord

- Après authentification, l’utilisateur accède à son tableau de bord.

- Celui-ci affiche la liste de ses demandes.

### Accès aux pages protégées

- L’utilisateur peut accéder :
    - au détail de ses demandes,
    - au formulaire de création d’une demande.

### Restrictions d’accès

- L’utilisateur ne peut consulter que ses propres demandes.

- Les actions non autorisées (ex. gestion des statuts) ne sont pas accessibles.

## A3 – Définition des rôles
### Rôle utilisateur

- Créer une demande.

- Consulter ses demandes.

- Modifier une demande uniquement si son statut est SUBMITTED.

- Consulter l’historique et les commentaires associés.

### Rôle gestionnaire

- Consulter toutes les demandes du système.

- Modifier le statut d’une demande.

- Ajouter des commentaires de traitement.

- Clôturer une demande.

### Différences de permissions

- Les actions de traitement sont strictement réservées au rôle gestionnaire.

- Les permissions sont conceptuellement gérées côté serveur.

## A4 – Définition des statuts
### Liste des statuts

- SUBMITTED

- IN_PROGRESS

- CLOSED

### Description des statuts

- SUBMITTED : demande créée, en attente de traitement.

- IN_PROGRESS : demande en cours de traitement par un gestionnaire.

- CLOSED : demande traitée et clôturée.

### Transitions autorisées et interdites

- Transitions autorisées :
    - SUBMITTED → IN_PROGRESS

    - IN_PROGRESS → CLOSED

- Transition interdite :

    - retour à SUBMITTED après IN_PROGRESS.
## A5 – Architecture globale
### Séparation front-end / back-end

- Front-end : React (interface utilisateur et navigation).

- Back-end : API REST (conceptuelle au L1).

### Responsabilités de chaque couche

- Front-end :

    - affichage de l’interface,

    - gestion de l’état,

    - navigation.

- Back-end :

    - logique métier,

    - sécurité,

    - gestion des données.

### Rôle de l’API REST

- Interface de communication entre le front-end et le back-end.

- Gestion de l’authentification, des demandes et des permissions.