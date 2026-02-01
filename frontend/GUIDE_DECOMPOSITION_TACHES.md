# Projet intégrateur – Décomposition des tâches par livrable
INF1743 – Développement d’applications web

Ce document fournit une décomposition détaillée du projet intégrateur,
structurée par livrable (L1, L2, L3), afin de faciliter l’organisation du travail
dans des équipes d’environ 7 étudiants et d’assurer une contribution équitable
de chaque membre.

---

## Consignes obligatoires 

- Toutes les tâches doivent être créées comme **GitHub Issues**.
- Chaque issue doit être :
  - clairement décrite,
  - associée à un livrable (L1, L2 ou L3),
  - assignée à un ou plusieurs membres.
- Les commits doivent référencer les issues correspondantes.
- L’évaluation tiendra compte de :
  - l’historique Git,
  - les issues GitHub,
  - la cohérence entre les contributions observées et la répartition déclarée du travail.

---

## Règles d’équité (obligatoires)

Pour **chaque livrable** :
- chaque membre doit être assigné à **au moins deux tâches** ;
- ces tâches doivent être de **nature différente**.

Une contribution limitée à un seul type de tâche
(ex. documentation seulement ou intégration seulement)
ne sera pas considérée comme suffisante.

---

# Livrable L1 – Analyse, architecture et interface initiale

## Tâches de conception / analyse (A)

### A1 – Analyse du parcours utilisateur non authentifié
- Accès à l’inscription
- Accès à la connexion
- Restrictions d’accès

### A2 – Analyse du parcours utilisateur authentifié
- Accès au tableau de bord
- Accès aux pages protégées
- Restrictions d’accès

### A3 – Définition des rôles
- Rôle utilisateur
- Rôle gestionnaire
- Différences de permissions

### A4 – Définition des statuts
- Liste des statuts
- Description de chaque statut
- Transitions autorisées et interdites

### A5 – Architecture globale
- Séparation front-end / back-end
- Responsabilités de chaque couche
- Rôle de l’API REST

---

## Tâches d’interface utilisateur (U – React, UI seulement)

### U1 – Page d’inscription (UI)
- Formulaire et champs requis
- Validation côté client
- Messages d’erreur simulés

### U2 – Page de connexion (UI)
- Formulaire
- Gestion des messages
- Navigation simulée

### U3 – Tableau de bord utilisateur (UI)
- Structure de la liste des demandes
- Affichage des champs requis
- Navigation vers le détail

### U4 – Détail d’une demande (UI)
- Affichage des informations
- Affichage des commentaires simulés
- Navigation retour

### U5 – Formulaire de création de demande (UI)
- Champs obligatoires
- Validation côté client
- Gestion de l’état

---

## Règle spécifique L1
Chaque membre doit être assigné à **au moins une tâche A**
et **au moins une tâche U**.

---

# Livrable L2 – Back-end, API et intégration
*(Travail parallélisable avec coordination)*

## Tâches back-end – Modélisation et fondations (B)

### B1 – Modélisation des entités principales
- Entité utilisateur
- Entité demande
- Relations entre entités

### B2 – Migrations et schéma initial
- Création des migrations
- Validation du schéma
- Données de test minimales

---

## Tâches back-end – Règles métier (R)

### R1 – Règles de création d’une demande
- Champs obligatoires
- Statut initial
- Association à l’utilisateur

### R2 – Règles de modification d’une demande
- Conditions de modification
- Cas interdits
- Messages d’erreur

### R3 – Règles de changement de statut
- Rôle requis
- Transitions autorisées
- Historisation

---

## Tâches back-end – Authentification et sécurité (S)

### S1 – Inscription des utilisateurs
- Endpoint d’inscription
- Validation serveur
- Hachage du mot de passe

### S2 – Authentification JWT
- Endpoint de connexion
- Génération du jeton
- Expiration

### S3 – Permissions et accès
- Accès utilisateur
- Accès gestionnaire
- Accès refusés explicites

---

## Tâches API REST (A)

### A1 – API création et lecture des demandes
- Endpoints POST / GET
- Codes HTTP appropriés
- Sérialisation

### A2 – API modification et suppression
- Endpoints PUT / DELETE
- Règles métier appliquées
- Messages d’erreur

---

## Tâches d’intégration front-end / back-end (I)

### I1 – Connexion des formulaires React à l’API
- Inscription
- Connexion
- Création de demande

### I2 – Gestion du jeton côté client
- Stockage
- Envoi dans les requêtes
- Déconnexion

### I3 – Gestion des erreurs API côté UI
- Messages utilisateur
- Accès refusés
- Données invalides

---

## Règle spécifique L2
Chaque membre doit être assigné à :
- au moins **une tâche back-end (B, R ou S)** ;
- et au moins **une tâche d’intégration ou API (A ou I)**.

Les tâches peuvent être réalisées en parallèle,
sous réserve d’une coordination minimale au sein de l’équipe.

---

## Niveau d’exigence attendu (équipes de grande taille)

Compte tenu de la taille des équipes,
un **niveau de finition plus élevé** est attendu pour la version finale du projet,
notamment en ce qui concerne :

- la conformité stricte au fonctionnement détaillé de l’application ;
- la robustesse de l’implémentation ;
- la gestion explicite et cohérente des erreurs ;
- la qualité globale du code et de l’interface utilisateur.

La taille des équipes ne doit pas conduire à une dilution des responsabilités.  
Chaque membre doit être en mesure de démontrer une
**contribution réelle, visible et traçable** au projet,
notamment à travers l’historique Git, les issues GitHub et la documentation finale.

---

# Livrable L3 – Version finale et préparation à la production

## Tâches de finalisation (F)

### F1 – Conformité complète au fonctionnement détaillé
- Vérification de chaque règle
- Cas limites
- Scénarios interdits

### F2 – Gestion complète des commentaires et de l’historique
- Ajout
- Consultation
- Affichage

### F3 – Passage à PostgreSQL
- Configuration via variables d’environnement
- Tests des migrations
- Ajustements nécessaires

### F4 – Sécurité et gestion des erreurs
- Accès non autorisés
- Messages contrôlés
- Comportement cohérent

### F5 – Amélioration UX
- Cohérence visuelle
- États de chargement
- Messages clairs

### F6 – Documentation finale
- Instructions complètes
- Architecture finale
- Répartition du travail par membre

---

## Règle spécifique L3
Chaque membre doit être assigné à **au moins deux tâches de finalisation**
et être en mesure de démontrer une contribution significative à la version finale.

---

## Remarque finale
Cette décomposition vise à structurer le travail et à assurer l’équité.
Les équipes peuvent subdiviser davantage les tâches,
à condition de respecter les règles d’assignation
et les exigences des livrables.
