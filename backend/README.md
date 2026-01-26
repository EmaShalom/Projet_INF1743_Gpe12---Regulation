# Backend (prévu) – API REST

Ce dossier contiendra le backend du projet (livrables ultérieurs) :
- API REST
- Authentification et autorisation
- Logique métier
- Gestion des statuts et des rôles
- Accès à la base de données

## A5 – Architecture globale

### Séparation front-end / back-end
- **Frontend (React)** : interface utilisateur, pages, navigation et validation côté client.
- **Backend (prévu)** : API REST, authentification, logique métier et base de données.

### Responsabilités de chaque couche
- **Frontend**
  - Affichage des pages U1 à U5.
  - Validation des formulaires côté client.
  - Simulation des messages et erreurs.
- **Backend**
  - Fourniture des endpoints REST.
  - Gestion des utilisateurs et des rôles.
  - Application des règles de transition des statuts.
  - Persistance des données.

### Rôle de l’API REST
- L’API REST permet la communication entre le frontend et le backend :
  - échanges en format **JSON**
  - endpoints pour les demandes, les statuts, les commentaires et l’authentification.