# Architecture Globale du Projet

## 📋 Introduction

L'application UQO-Requests suit une **architecture 3 couches** (three-tier architecture) séparant clairement la présentation, la logique métier et les données.

Ce document décrit :
- L'architecture générale en 3 couches
- Les technologies utilisées par couche
- Les communications entre les couches
- Les avantages de cette architecture

---

## 🏗️ Architecture 3 Couches

### Vue d'ensemble

```
┌─────────────────────────────────────────┐
│         COUCHE 1 : FRONTEND             │
│              (React)                     │
│                                         │
│  - Interface utilisateur (UI)           │
│  - Navigation (React Router)            │
│  - Gestion d'état (Context API)         │
│  - Validation côté client               │
└─────────────┬───────────────────────────┘
              │
              │ HTTP/HTTPS (API REST)
              │ Format: JSON
              │
┌─────────────▼───────────────────────────┐
│         COUCHE 2 : BACKEND              │
│         (Django REST Framework)          │
│                                         │
│  - API REST (endpoints)                 │
│  - Logique métier                       │
│  - Authentification JWT                 │
│  - Validation des données               │
│  - Autorisation (permissions)           │
└─────────────┬───────────────────────────┘
              │
              │ ORM Django
              │ Requêtes SQL
              │
┌─────────────▼───────────────────────────┐
│         COUCHE 3 : BASE DE DONNÉES      │
│            (PostgreSQL)                  │
│                                         │
│  - Stockage persistant                  │
│  - Tables relationnelles                │
│  - Contraintes d'intégrité              │
│  - Indexes pour performance             │
└─────────────────────────────────────────┘
```

---

## 📱 COUCHE 1 : Frontend (Interface Utilisateur)

### Rôle

La couche **présentation** responsable de l'interface utilisateur et de l'expérience utilisateur (UX).

### Technologies

**Framework principal :**
- **React 18+** : Bibliothèque JavaScript pour construire des interfaces utilisateur
- **React Router 6** : Navigation côté client (SPA - Single Page Application)
- **Vite** : Build tool moderne et rapide

**Langages :**
- **JavaScript (ES6+)** : Logique de l'application
- **HTML5** : Structure sémantique
- **CSS3** : Styles et mise en page (avec variables CSS)

**Gestion d'état :**
- **Context API** : État global (utilisateur connecté, authentification)
- **useState/useEffect** : État local des composants

### Responsabilités

**1. Affichage de l'interface utilisateur**
- Rendu des composants React
- Mise à jour dynamique du DOM
- Navigation entre les pages (sans rechargement)

**2. Validation côté client**
- Validation des formulaires en temps réel
- Messages d'erreur immédiats
- Amélioration de l'expérience utilisateur

**3. Communication avec le backend**
- Appels API REST (fetch)
- Envoi de requêtes HTTP (GET, POST, PUT, PATCH, DELETE)
- Gestion des réponses (succès, erreurs)

**4. Gestion de l'authentification**
- Stockage du token JWT (localStorage)
- Ajout du token dans les headers des requêtes
- Redirection si non authentifié

### Structure des pages

```
Pages principales (Livrable L1) :
├── /login          → Connexion
├── /register       → Inscription
├── /dashboard      → Tableau de bord
├── /requests/:id   → Détail d'une demande
├── /requests/new   → Création d'une demande
└── /requests/:id/edit → Modification (si SUBMITTED)
```

### Exemple de flux

**Création d'une demande :**

1. Utilisateur remplit le formulaire `/requests/new`
2. Validation côté client (champs requis, longueurs)
3. Soumission du formulaire
4. Envoi POST à `/api/requests/` avec token JWT
5. Réception de la réponse (201 Created)
6. Redirection vers `/dashboard`
7. Affichage de la nouvelle demande

---

## ⚙️ COUCHE 2 : Backend (Logique Métier)

### Rôle

La couche **logique métier** responsable du traitement des données et de l'application des règles métier.

### Technologies

**Framework principal :**
- **Django 4+** : Framework web Python
- **Django REST Framework (DRF)** : Extension pour créer des API REST

**Authentification :**
- **JWT (JSON Web Tokens)** : Tokens stateless pour l'authentification
- **djangorestframework-simplejwt** : Implémentation JWT pour Django

**Base de données :**
- **PostgreSQL** : Base de données relationnelle
- **psycopg2** : Adaptateur PostgreSQL pour Python

### Responsabilités

**1. API REST**
- Exposition des endpoints HTTP
- Gestion des requêtes (GET, POST, PUT, PATCH, DELETE)
- Retour des réponses JSON
- Codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)

**2. Authentification et autorisation**
- Vérification des identifiants (login)
- Génération de tokens JWT
- Vérification du token à chaque requête
- Contrôle des permissions (rôles)

**3. Validation des données**
- Validation serveur (même si validé côté client)
- Règles métier complexes
- Contraintes d'intégrité
- Messages d'erreur structurés

**4. Logique métier**
- Transitions de statuts autorisées
- Règles de modification (SUBMITTED uniquement)
- Calculs et transformations
- Création d'historique automatique

### Endpoints principaux (Livrable L2)

```
Authentification :
POST   /api/auth/register/        → Inscription
POST   /api/auth/login/           → Connexion
POST   /api/auth/refresh/         → Rafraîchir le token

Demandes :
GET    /api/requests/             → Liste des demandes
POST   /api/requests/             → Créer une demande
GET    /api/requests/:id/         → Détail d'une demande
PUT    /api/requests/:id/         → Modifier (complète)
PATCH  /api/requests/:id/         → Modifier (partielle)

Statuts :
PATCH  /api/requests/:id/status/  → Changer le statut

Commentaires :
GET    /api/requests/:id/comments/ → Liste commentaires
POST   /api/requests/:id/comments/ → Ajouter commentaire

Historique :
GET    /api/requests/:id/history/  → Historique statuts
```

### Exemple de flux

**Changement de statut (gestionnaire) :**

1. Frontend envoie PATCH `/api/requests/5/status/`
   ```json
   {
     "nouveau_statut": "IN_PROGRESS"
   }
   ```

2. Backend vérifie :
   - Token JWT valide ✓
   - Utilisateur authentifié ✓
   - Rôle = gestionnaire ✓
   - Transition autorisée (SUBMITTED → IN_PROGRESS) ✓

3. Backend effectue :
   - Mise à jour du statut
   - Création d'une entrée dans l'historique
   - Retour de la demande mise à jour

4. Frontend reçoit 200 OK avec les nouvelles données

---

## 💾 COUCHE 3 : Base de Données

### Rôle

La couche **données** responsable du stockage persistant et de l'intégrité des données.

### Technologie

**PostgreSQL 14+**
- Base de données relationnelle open-source
- ACID compliant (Atomicité, Cohérence, Isolation, Durabilité)
- Support des transactions
- Indexes pour optimisation

### Tables principales (Livrable L2)

```sql
-- Table Utilisateurs
users
├── id (PK, SERIAL)
├── nom_complet (VARCHAR 150)
├── email (VARCHAR 255, UNIQUE)
├── password (VARCHAR 255, haché)
├── role (VARCHAR 50)
└── date_creation (TIMESTAMP)

-- Table Demandes
requests
├── id (PK, SERIAL)
├── titre (VARCHAR 200)
├── description (TEXT)
├── type (VARCHAR 50)
├── statut (VARCHAR 50)
├── createur_id (FK → users.id)
├── date_creation (TIMESTAMP)
└── date_modification (TIMESTAMP)

-- Table Commentaires
comments
├── id (PK, SERIAL)
├── request_id (FK → requests.id)
├── auteur_id (FK → users.id)
├── contenu (TEXT)
└── date_creation (TIMESTAMP)

-- Table Historique
status_history
├── id (PK, SERIAL)
├── request_id (FK → requests.id)
├── ancien_statut (VARCHAR 50)
├── nouveau_statut (VARCHAR 50)
├── modifie_par_id (FK → users.id)
└── date_modification (TIMESTAMP)
```

### Contraintes d'intégrité

**Clés étrangères (Foreign Keys) :**
- `requests.createur_id` → `users.id` (CASCADE on delete)
- `comments.request_id` → `requests.id` (CASCADE on delete)
- `comments.auteur_id` → `users.id` (CASCADE on delete)
- `status_history.request_id` → `requests.id` (CASCADE on delete)
- `status_history.modifie_par_id` → `users.id` (SET NULL on delete)

**Contraintes UNIQUE :**
- `users.email` : Un email = un compte

**Contraintes CHECK :**
- `requests.statut` IN ('SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
- `users.role` IN ('utilisateur', 'gestionnaire')

### Indexes pour performance

```sql
CREATE INDEX idx_requests_createur ON requests(createur_id);
CREATE INDEX idx_requests_statut ON requests(statut);
CREATE INDEX idx_comments_request ON comments(request_id);
CREATE INDEX idx_history_request ON status_history(request_id);
```

---

## 🔄 Communication entre Couches

### Frontend → Backend (Requêtes HTTP)

**Format de communication :** JSON

**Headers requis :**
```http
Content-Type: application/json
Authorization: Bearer <token_jwt>
```

**Exemple de requête POST :**
```javascript
// Frontend (React)
const response = await fetch('/api/requests/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    titre: 'Problème VPN',
    description: 'Je ne peux pas me connecter au VPN',
    type: 'Technique'
  })
})

const data = await response.json()
// data = { id: 5, titre: 'Problème VPN', ... }
```

### Backend → Base de Données (ORM Django)

**Format de communication :** ORM (Object-Relational Mapping)

**Exemple de requête :**
```python
# Backend (Django)
from .models import Request

# Créer une demande
request = Request.objects.create(
    titre='Problème VPN',
    description='Je ne peux pas me connecter au VPN',
    type='Technique',
    statut='SUBMITTED',
    createur=user  # Instance User
)

# Django ORM génère automatiquement :
# INSERT INTO requests (titre, description, type, statut, createur_id, date_creation)
# VALUES ('Problème VPN', '...', 'Technique', 'SUBMITTED', 1, NOW());
```

---

## ✅ Avantages de cette Architecture

### 1. Séparation des préoccupations (Separation of Concerns)

**Chaque couche a une responsabilité unique :**
- Frontend : Présentation
- Backend : Logique métier
- Base de données : Persistance

**Avantage :** Code plus maintenable et testable.

### 2. Scalabilité horizontale

**Chaque couche peut être mise à l'échelle indépendamment :**
- Ajouter des serveurs frontend (CDN)
- Ajouter des serveurs backend (load balancing)
- Répliquer la base de données (master-slave)

**Avantage :** Performance et disponibilité accrues.

### 3. Flexibilité technologique

**Changer une couche sans affecter les autres :**
- Remplacer React par Vue.js (frontend)
- Remplacer Django par FastAPI (backend)
- Remplacer PostgreSQL par MySQL (base de données)

**Avantage :** Évolution technologique facilitée.

### 4. Sécurité renforcée

**Validation en plusieurs points :**
1. Frontend : Validation UX
2. Backend : Validation sécurisée
3. Base de données : Contraintes d'intégrité

**Avantage :** Protection contre les attaques.

### 5. Développement parallèle

**Équipes peuvent travailler en parallèle :**
- Équipe frontend : React
- Équipe backend : Django
- Équipe BDD : Optimisation

**Avantage :** Gain de temps de développement.

---

## 🚀 Déploiement (Livrable L3)

### Architecture de déploiement

```
┌────────────────┐
│   Utilisateur  │
└────────┬───────┘
         │
         │ HTTPS
         ▼
┌────────────────┐
│   Cloudflare   │ (CDN + Protection DDoS)
│  ou Nginx      │
└────────┬───────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Frontend│ │Backend │
│ (Vercel│ │(Railway│
│  ou    │ │  ou    │
│ Netlify│ │ Heroku)│
│)       │ │        │
└────────┘ └───┬────┘
              │
              │ Connection Pool
              ▼
         ┌────────┐
         │PostgreSQL│
         │(Supabase│
         │  ou     │
         │ Railway)│
         └────────┘
```

### Environnements

**1. Développement (local) :**
- Frontend : `localhost:5173` (Vite dev server)
- Backend : `localhost:8000` (Django runserver)
- BDD : `localhost:5432` (PostgreSQL local)

**2. Staging (pré-production) :**
- Frontend : `staging-app.vercel.app`
- Backend : `staging-api.railway.app`
- BDD : PostgreSQL hébergé

**3. Production :**
- Frontend : `uqo-requests.ca`
- Backend : `api.uqo-requests.ca`
- BDD : PostgreSQL hébergé (répliqué)

---

## 📚 Technologies Détaillées

### Frontend Stack

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.2+ | Bibliothèque UI |
| React Router | 6.20+ | Navigation SPA |
| Vite | 5.0+ | Build tool |
| CSS3 | - | Styles (variables CSS) |

### Backend Stack

| Technologie | Version | Rôle |
|-------------|---------|------|
| Python | 3.11+ | Langage backend |
| Django | 4.2+ | Framework web |
| DRF | 3.14+ | API REST |
| SimpleJWT | 5.3+ | Authentification JWT |
| psycopg2 | 2.9+ | Driver PostgreSQL |

### Base de Données

| Technologie | Version | Rôle |
|-------------|---------|------|
| PostgreSQL | 14+ | SGBD relationnel |

### DevOps (L3)

| Technologie | Rôle |
|-------------|------|
| Docker | Containerisation |
| Docker Compose | Orchestration locale |
| GitHub Actions | CI/CD |
| Vercel/Netlify | Déploiement frontend |
| Railway/Heroku | Déploiement backend |

---

## 🔐 Flux d'Authentification Complet

### Inscription

```
1. User → Frontend : Remplit formulaire /register
2. Frontend → Backend : POST /api/auth/register/
   {
     "nom_complet": "Jean Dupont",
     "email": "jean@example.com",
     "password": "Password123"
   }
3. Backend → BDD : INSERT INTO users (...)
4. Backend → Frontend : 201 Created
   {
     "id": 1,
     "nom_complet": "Jean Dupont",
     "email": "jean@example.com",
     "role": "utilisateur"
   }
5. Frontend → User : Redirection /login
```

### Connexion

```
1. User → Frontend : Entre email + password
2. Frontend → Backend : POST /api/auth/login/
   {
     "email": "jean@example.com",
     "password": "Password123"
   }
3. Backend → BDD : SELECT * FROM users WHERE email = ...
4. Backend : Vérifie password (bcrypt.checkpw)
5. Backend : Génère token JWT
6. Backend → Frontend : 200 OK
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "user": {
       "id": 1,
       "nom_complet": "Jean Dupont",
       "role": "utilisateur"
     }
   }
7. Frontend : Stocke token dans localStorage
8. Frontend → User : Redirection /dashboard
```

### Requête authentifiée

```
1. User → Frontend : Demande /dashboard
2. Frontend → Backend : GET /api/requests/
   Headers: {
     Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
   }
3. Backend : Décode et vérifie le JWT
4. Backend : Extrait user_id du token
5. Backend → BDD : SELECT * FROM requests WHERE createur_id = 1
6. Backend → Frontend : 200 OK [liste des demandes]
7. Frontend → User : Affiche les demandes
```
