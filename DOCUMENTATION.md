# Documentation Technique — UQO Requests
### Système de gestion des demandes universitaires
**INF1743 — Groupe 12 | Université du Québec en Outaouais**

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Architecture globale](#2-architecture-globale)
3. [Technologies utilisées](#3-technologies-utilisées)
4. [Installation et configuration](#4-installation-et-configuration)
5. [Structure du projet](#5-structure-du-projet)
6. [Frontend — React / Vite](#6-frontend--react--vite)
7. [Backend — Django REST Framework](#7-backend--django-rest-framework)
8. [Base de données — PostgreSQL](#8-base-de-données--postgresql)
9. [Système d'authentification](#9-système-dauthentification)
10. [Rôles et permissions](#10-rôles-et-permissions)
11. [Points d'accès API (Endpoints)](#11-points-daccès-api-endpoints)
12. [Composants et pages frontend](#12-composants-et-pages-frontend)
13. [Flux de données](#13-flux-de-données)
14. [Décisions techniques](#14-décisions-techniques)
15. [Évolutions possibles](#15-évolutions-possibles)

---

## 1. Présentation du projet

**UQO Requests** est une plateforme web de gestion des demandes administratives destinée aux étudiants et au personnel de l'Université du Québec en Outaouais. Elle permet aux utilisateurs de soumettre, suivre et communiquer autour de leurs demandes, tandis que les gestionnaires peuvent superviser, modifier le statut et répondre à ces demandes via une interface unifiée.

### Objectifs fonctionnels

- Permettre aux étudiants de soumettre des demandes administratives catégorisées
- Offrir un suivi en temps réel du statut de chaque demande
- Fournir un canal de communication intégré entre l'étudiant et le gestionnaire
- Centraliser la gestion des demandes pour les gestionnaires
- Sécuriser les accès via une authentification à deux facteurs (2FA par courriel)

### Utilisateurs cibles

| Rôle | Description |
|---|---|
| `utilisateur` | Étudiant pouvant créer, consulter et commenter ses propres demandes |
| `gestionnaire` | Personnel administratif pouvant consulter toutes les demandes, modifier les statuts et répondre |

---

## 2. Architecture globale

L'application suit une architecture **client-serveur découplée** :

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATEUR WEB                        │
│          React SPA (Single Page Application)             │
│                  Port 5173 (dev)                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/JSON (Axios)
                       │ Authorization: Bearer <JWT>
┌──────────────────────▼──────────────────────────────────┐
│              SERVEUR DJANGO REST FRAMEWORK               │
│                  Port 8000 (dev)                         │
│  /api/auth/   /api/requests/   /api/notifications/       │
└──────────────────────┬──────────────────────────────────┘
                       │ ORM Django (psycopg2)
┌──────────────────────▼──────────────────────────────────┐
│               BASE DE DONNÉES PostgreSQL                 │
│              uqo_requests_db — Port 5432                 │
└─────────────────────────────────────────────────────────┘
```

### Flux d'une requête type

1. L'utilisateur interagit avec l'interface React
2. React envoie une requête HTTP via Axios avec le jeton JWT en en-tête
3. Django valide le jeton, applique les permissions, exécute la logique métier
4. Django interroge PostgreSQL via l'ORM
5. La réponse JSON remonte jusqu'au composant React qui met à jour l'état

---

## 3. Technologies utilisées

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| React | 18.x | Framework UI (composants, état, contexte) |
| Vite | 5.x | Outil de compilation et serveur de développement |
| React Router v6 | 6.x | Navigation côté client (routage SPA) |
| Axios | 1.x | Client HTTP, intercepteurs JWT |
| react-icons | 4.x | Bibliothèque d'icônes SVG |
| CSS Variables | natif | Système de jetons de conception |

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| Python | 3.11+ | Langage de programmation |
| Django | 4.x | Cadre logiciel web |
| Django REST Framework | 3.x | Construction de l'API REST |
| SimpleJWT | 5.x | Génération et validation des jetons JWT |
| psycopg2 | 2.x | Connecteur PostgreSQL |
| django-cors-headers | 4.x | Gestion des requêtes cross-origin |

### Infrastructure

| Technologie | Rôle |
|---|---|
| PostgreSQL 15 | Base de données relationnelle |
| Render (optionnel) | Hébergement infonuagique (fichier `render.yaml` inclus) |

---

## 4. Installation et configuration

### Prérequis

- Node.js 18+
- Python 3.11+
- PostgreSQL 15 en cours d'exécution localement

### 4.1 Base de données

```sql
CREATE DATABASE uqo_requests_db;
CREATE USER postgres WITH PASSWORD '0000';
GRANT ALL PRIVILEGES ON DATABASE uqo_requests_db TO postgres;
```

### 4.2 Backend

```bash
# Depuis la racine du projet
python -m venv .venv
source .venv/Scripts/activate      # Windows / Git Bash
pip install -r backends/requirements.txt

cd backends
python manage.py migrate
python manage.py createsuperuser   # Créer un administrateur
python manage.py runserver         # Démarre sur http://127.0.0.1:8000
```

Variables d'environnement (fichier `.env` dans `backends/`) :

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DB_NAME=uqo_requests_db
DB_USER=postgres
DB_PASSWORD=0000
DB_HOST=localhost
DB_PORT=5432
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### 4.3 Frontend

```bash
cd frontend
npm install
npm run dev     # Démarre sur http://localhost:5173
```

Variable d'environnement (`frontend/.env`) :

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## 5. Structure du projet

```
Projet_INF1743_Gpe12---Regulation/
├── backends/
│   ├── core/
│   │   ├── settings.py          # Configuration Django
│   │   └── urls.py              # Routage principal
│   ├── apps/
│   │   ├── users/               # Authentification, profils
│   │   ├── requests_app/        # CRUD des demandes
│   │   ├── comments/            # Commentaires
│   │   └── notifications/       # Notifications
│   ├── permissions/
│   │   └── roles.py             # IsGestionnaire, IsOwnerOrGestionnaire
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── assets/              # Images, logo
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── Layout.jsx       # Coquille principale (topbar + sidebar + footer)
│   │   │   ├── Navbar.jsx       # Barre de navigation supérieure (topbar 76px)
│   │   │   ├── Sidebar.jsx      # Navigation latérale fixe (240px)
│   │   │   ├── NotificationBell.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # État d'authentification global
│   │   │   ├── useAuth.js       # Crochet réexportant useAuth
│   │   │   └── LanguageContext.jsx  # Traductions FR/EN
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── MyRequestsPage.jsx
│   │   │   ├── RequestDetailPage.jsx
│   │   │   ├── CreateRequestPage.jsx
│   │   │   ├── EditRequestPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Instance Axios centralisée
│   │   │   ├── authService.js
│   │   │   ├── requestService.js
│   │   │   └── notificationService.js
│   │   ├── styles/
│   │   │   ├── variables.css    # Jetons de conception (design tokens)
│   │   │   └── global.css
│   │   ├── utils/
│   │   │   ├── constants.js     # REQUEST_STATUS, REQUEST_TYPES
│   │   │   ├── validators.js
│   │   │   └── formatters.js
│   │   └── App.jsx              # Routage principal
│   └── package.json
└── render.yaml                  # Configuration de déploiement
```

---

## 6. Frontend — React / Vite

### 6.1 Disposition et navigation

L'application utilise une architecture de type **SaaS moderne** avec trois zones fixes :

#### Barre supérieure (Topbar) — `Navbar.jsx`

- Hauteur : 76 px, position fixe, largeur totale de la fenêtre
- Palette beige clair (`#EDE6E8`) avec dégradé et ombre portée
- Contenu de gauche à droite : logo UQO | message de bienvenue et date | barre de recherche | bouton FR/EN | icône Paramètres | cloche de notifications | bouton Nouvelle demande (vert)
- La barre de recherche navigue vers `/my-requests?q=...` à l'appui de la touche Entrée

#### Navigation latérale (Sidebar) — `Sidebar.jsx`

- Largeur : 240 px, position fixe, commence sous la topbar
- Palette sombre (`#2F353B`)
- Liens : Accueil, Tableau de bord, Mes demandes, Notifications
- Bas de page : Paramètres, Déconnecter (couleur neutre — aucune couleur rouge alarmante)
- Affiche un badge numérique sur les notifications non lues, mis à jour toutes les 30 secondes

#### Pied de page (Footer) — `Layout.jsx`

- Fond très sombre (`#23282D`), pleine largeur du navigateur
- Positionné comme frère de `.app-body` dans l'arborescence DOM pour ne pas hériter du décalage gauche

### 6.2 Système d'authentification frontend

Le contexte `AuthContext.jsx` gère l'état global de connexion :

```javascript
// Jetons stockés dans localStorage
const TOKEN_KEY = 'uqo_token'
const USER_KEY  = 'uqo_user'

// Actions disponibles via useAuth()
login(email, password)        // Mode simulé (développement) — contourne l'API
loginFromToken(token, user)   // Après vérification 2FA réelle
logout()                      // Vide localStorage et l'état React
updateUser(updates)           // Met à jour le profil localement
```

**Mode de développement** : Des identifiants fictifs permettent de travailler sans serveur backend actif :
- Utilisateur : `user@example.com` / `Password123`
- Gestionnaire : `manager@example.com` / `Manager123`

Les jetons de développement commencent par `mock-jwt-` — l'intercepteur Axios les détecte et ne vide pas la session lors d'une erreur 401.

### 6.3 Service API centralisé — `api.js`

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
})

// Intercepteur requête : attache le JWT automatiquement
api.interceptors.request.use(config => {
  const token = localStorage.getItem('uqo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercepteur réponse : gère l'expiration de session
api.interceptors.response.use(null, error => {
  if (error.response?.status === 401) {
    const token = localStorage.getItem('uqo_token')
    if (!token?.startsWith('mock-jwt-')) {
      localStorage.removeItem('uqo_token')
      window.location.href = '/login?session=expired'
    }
  }
  return Promise.reject(error)
})
```

### 6.4 Internationalisation (FR/EN)

Le contexte `LanguageContext.jsx` contient toutes les traductions de l'application sous forme d'un objet imbriqué. Le changement de langue est instantané sans rechargement de la page. Toutes les pages utilisent le crochet `useLang()` pour accéder aux textes traduits.

### 6.5 Pages principales

#### Tableau de bord (`/dashboard`) — `DashboardPage.jsx`

Vue analytique composée de :
- **5 cartes de statistiques cliquables** : Total, Soumis, En cours, Résolus, Fermés — chacune redirige vers `/my-requests?status=X`
- **Graphique donut SVG** (sans bibliothèque externe) : répartition des demandes par statut, construit avec les propriétés SVG `stroke-dasharray` et `strokeDashoffset`
- **Historique d'activité récente** : liste des derniers changements de statut avec horodatage relatif
- **Tableau des 5 dernières demandes** : titre, catégorie, statut, date
- **Aperçu des notifications** non lues

#### Mes demandes (`/my-requests`) — `MyRequestsPage.jsx`

Liste complète avec :
- Filtres par statut et par catégorie
- Tri par date (croissant/décroissant), titre ou statut
- Recherche textuelle dans le titre, la description et le nom du créateur
- Pagination (10 demandes par page)
- Lecture des paramètres URL au montage : `useSearchParams()` → `?status=` et `?q=`
- Titre contextuel selon le filtre actif : « Demandes soumises », « Demandes en cours », etc.
- Lien retour « ← Tableau de bord » affiché quand un filtre de statut est actif
- Actions par carte : Voir | Modifier (si propriétaire et statut SOUMIS) | Supprimer avec confirmation inline

#### Détail d'une demande (`/requests/:id`) — `RequestDetailPage.jsx`

- Mise en page deux colonnes : informations et historique des statuts à gauche, conversation à droite
- Interface de messagerie avec distinction visuelle (bulle verte pour gestionnaire, grise pour utilisateur)
- Contrôles de changement de statut pour les gestionnaires uniquement

#### Création de demande (`/requests/new`) — `CreateRequestPage.jsx`

- Formulaire avec validation en temps réel et compteur de caractères
- Mise en page avec panneau de conseils latéral

#### Paramètres (`/settings`) — `SettingsPage.jsx`

Navigation par onglets verticaux (position collante) :
- **Profil** : avatar avec initiales générées, champs éditables (prénom, nom, département, matricule), badge de rôle
- **Compte** : informations en lecture seule (courriel, identifiant, date d'inscription, dernier accès)
- **Sécurité** : formulaire de changement de mot de passe avec affichage/masquage, session active, statut 2FA, bouton de déconnexion de tous les appareils
- **Support** : cartes de contact (courriel, téléphone, horaires), FAQ accordéon (5 questions), liens légaux

---

## 7. Backend — Django REST Framework

### 7.1 Configuration

Le fichier `backends/core/settings.py` configure :
- Base de données PostgreSQL via paramètres directs (`DB_*`)
- Authentification JWT via `rest_framework_simplejwt`
- CORS ouvert en développement (`CORS_ALLOW_ALL_ORIGINS = True`)
- Serveur de courriel console en développement (codes 2FA affichés dans le terminal Django)

### 7.2 Applications Django

#### `apps/users` — Gestion des utilisateurs

- Modèle utilisateur personnalisé héritant de `AbstractBaseUser`
- Champs : `email` (identifiant unique), `nom_complet`, `role`, `date_inscription`, `is_active`
- Vues : inscription, connexion (étape 1 : envoi du code), vérification 2FA (étape 2 : JWT), réinitialisation du mot de passe

#### `apps/requests_app` — Demandes

- Modèle `Demande` : `titre`, `description`, `type`, `statut`, `createur`, `date_creation`, `date_modification`
- Statuts possibles : `SUBMITTED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`
- Enregistrement automatique de l'historique à chaque changement de statut

#### `apps/comments` — Commentaires

- Modèle `Commentaire` : lié à une demande et à un auteur, avec horodatage
- Accessible via `/api/requests/:id/comments/`

#### `apps/notifications` — Notifications

- Créées automatiquement lors d'un nouveau commentaire ou changement de statut
- Champs : `destinataire`, `demande`, `contenu`, `auteur`, `type`, `date_creation`

### 7.3 Permissions

```python
# backends/permissions/roles.py

class IsGestionnaire(BasePermission):
    """Autorise uniquement les utilisateurs avec le rôle gestionnaire."""
    def has_permission(self, request, view):
        return request.user.role == 'gestionnaire'

class IsOwnerOrGestionnaire(BasePermission):
    """Autorise le propriétaire de la ressource ou tout gestionnaire."""
    def has_object_permission(self, request, view, obj):
        return obj.createur == request.user or request.user.role == 'gestionnaire'
```

---

## 8. Base de données — PostgreSQL

### 8.1 Schéma principal

```
utilisateurs
  id              SERIAL PRIMARY KEY
  email           VARCHAR UNIQUE NOT NULL
  nom_complet     VARCHAR NOT NULL
  role            VARCHAR (utilisateur | gestionnaire)
  password_hash   VARCHAR NOT NULL
  date_inscription TIMESTAMP
  is_active       BOOLEAN

demandes
  id              SERIAL PRIMARY KEY
  titre           VARCHAR NOT NULL
  description     TEXT
  type            VARCHAR NOT NULL
  statut          VARCHAR (SUBMITTED | IN_PROGRESS | RESOLVED | CLOSED)
  createur_id     FK → utilisateurs
  date_creation   TIMESTAMP
  date_modification TIMESTAMP

commentaires
  id              SERIAL PRIMARY KEY
  contenu         TEXT NOT NULL
  auteur_id       FK → utilisateurs
  demande_id      FK → demandes
  date_creation   TIMESTAMP

historique_statuts
  id              SERIAL PRIMARY KEY
  demande_id      FK → demandes
  ancien_statut   VARCHAR
  nouveau_statut  VARCHAR
  modifie_par_id  FK → utilisateurs
  date_modification TIMESTAMP

notifications
  id              SERIAL PRIMARY KEY
  destinataire_id FK → utilisateurs
  demande_id      FK → demandes
  auteur_id       FK → utilisateurs
  contenu         TEXT
  type            VARCHAR
  date_creation   TIMESTAMP

codes_reinitialisation
  id              SERIAL PRIMARY KEY
  utilisateur_id  FK → utilisateurs
  code            VARCHAR(6)
  date_expiration TIMESTAMP
  utilise         BOOLEAN
```

### 8.2 Catégories de demandes (`REQUEST_TYPES`)

Définis dans `frontend/src/utils/constants.js` et utilisés comme options fixes dans le formulaire de création. Les valeurs sont synchronisées avec les choix du modèle Django.

### 8.3 Cycle de vie d'une demande

```
[SUBMITTED] → [IN_PROGRESS] → [RESOLVED] → [CLOSED]
```

Seuls les gestionnaires peuvent effectuer ces transitions. Un étudiant ne peut modifier sa demande que si elle est encore au statut `SUBMITTED`.

---

## 9. Système d'authentification

### 9.1 Flux de connexion (authentification à deux facteurs)

```
Étape 1 — Soumission des identifiants
  POST /api/auth/login/
  Corps : { email, password }
  → Le backend vérifie les identifiants
  → Si valides : génère un code à 6 chiffres et l'envoie par courriel
  → En développement : le code est affiché dans le terminal Django

Étape 2 — Vérification du code
  POST /api/auth/verify-login/
  Corps : { email, code }
  → Le backend valide le code (expiration 15 min, usage unique)
  → Retourne : { access: "JWT...", refresh: "JWT...", user: {...} }
  → Le frontend stocke le jeton dans localStorage (clé : uqo_token)

Requêtes authentifiées
  Toutes les requêtes suivantes incluent :
  En-tête : Authorization: Bearer <access_token>
```

### 9.2 Réinitialisation de mot de passe

```
1. POST /api/auth/forgot-password/      → Envoi du code par courriel
2. POST /api/auth/verify-reset-code/    → Validation du code
3. POST /api/auth/reset-password/       → Enregistrement du nouveau mot de passe
```

### 9.3 Sécurité des jetons

- Les jetons `access` ont une durée de vie courte (configurable, 15 à 60 minutes)
- Les jetons `refresh` permettent de renouveler sans saisir à nouveau les identifiants
- L'intercepteur Axios détecte les réponses 401 et déclenche une déconnexion automatique
- Exception : les jetons de développement (`mock-jwt-*`) ne déclenchent pas de déconnexion

---

## 10. Rôles et permissions

| Action | Utilisateur | Gestionnaire |
|---|---|---|
| Voir ses propres demandes | ✓ | ✓ |
| Voir toutes les demandes | ✗ | ✓ |
| Créer une demande | ✓ | ✓ |
| Modifier sa demande (statut SOUMIS) | ✓ | ✗ |
| Supprimer sa demande (statut SOUMIS) | ✓ | ✗ |
| Changer le statut d'une demande | ✗ | ✓ |
| Commenter une demande ouverte | ✓ | ✓ |
| Consulter le tableau de bord analytique | ✓ | ✓ |
| Voir le nom du créateur dans la liste | ✗ | ✓ |

---

## 11. Points d'accès API (Endpoints)

### Authentification — `/api/auth/`

| Méthode | Endpoint | Authentification requise | Description |
|---|---|---|---|
| POST | `/auth/register/` | Non | Inscription d'un nouvel utilisateur |
| POST | `/auth/login/` | Non | Connexion (envoi du code 2FA) |
| POST | `/auth/verify-login/` | Non | Vérification du code → retourne JWT |
| POST | `/auth/forgot-password/` | Non | Demande de réinitialisation du mot de passe |
| POST | `/auth/verify-reset-code/` | Non | Validation du code de réinitialisation |
| POST | `/auth/reset-password/` | Non | Enregistrement du nouveau mot de passe |
| POST | `/auth/change-password/` | Oui | Changement de mot de passe (utilisateur connecté) |

### Demandes — `/api/requests/`

| Méthode | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/requests/` | Connecté | Liste des demandes (filtrée par rôle) |
| POST | `/requests/` | Connecté | Créer une nouvelle demande |
| GET | `/requests/:id/` | Propriétaire ou gestionnaire | Détail d'une demande |
| PUT | `/requests/:id/` | Propriétaire (statut SOUMIS) | Modifier une demande |
| DELETE | `/requests/:id/` | Propriétaire (statut SOUMIS) | Supprimer une demande |
| PATCH | `/requests/:id/status/` | Gestionnaire uniquement | Changer le statut |
| GET | `/requests/:id/comments/` | Propriétaire ou gestionnaire | Liste des commentaires |
| POST | `/requests/:id/comments/` | Propriétaire ou gestionnaire | Ajouter un commentaire |

### Notifications — `/api/notifications/`

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/notifications/` | Liste des notifications de l'utilisateur connecté |

---

## 12. Composants et pages frontend

### Composants réutilisables

| Composant | Fichier | Description |
|---|---|---|
| `Layout` | `Layout.jsx` | Coquille principale orchestrant topbar, sidebar, contenu et footer |
| `Navbar` | `Navbar.jsx` | Barre supérieure 76 px avec recherche, notifications et bouton d'action |
| `Sidebar` | `Sidebar.jsx` | Navigation latérale fixe 240 px, palette sombre, badge notifications |
| `NotificationBell` | `NotificationBell.jsx` | Icône cloche avec panneau déroulant de notifications |
| `ProtectedRoute` | `ProtectedRoute.jsx` | Redirige vers `/login` si l'utilisateur n'est pas authentifié |

### Pages protégées (authentification requise)

| Route | Composant | Description |
|---|---|---|
| `/dashboard` | `DashboardPage` | Vue analytique : statistiques, graphique, activité récente |
| `/my-requests` | `MyRequestsPage` | Liste filtrée et paginée des demandes |
| `/requests/new` | `CreateRequestPage` | Formulaire de création de demande |
| `/requests/:id` | `RequestDetailPage` | Détail d'une demande avec messagerie |
| `/requests/:id/edit` | `EditRequestPage` | Modification (statut SOUMIS uniquement) |
| `/notifications` | `NotificationsPage` | Centre de notifications |
| `/settings` | `SettingsPage` | Paramètres profil, compte, sécurité, support |

### Pages publiques

| Route | Composant | Description |
|---|---|---|
| `/` | `HomePage` | Page d'accueil de l'application |
| `/login` | `LoginPage` | Connexion en deux étapes (2FA) |
| `/register` | `RegisterPage` | Inscription d'un nouveau compte |
| `/forgot-password` | `ForgotPasswordPage` | Réinitialisation du mot de passe en 3 étapes |

---

## 13. Flux de données

### Création d'une demande

```
Utilisateur remplit le formulaire (CreateRequestPage)
  → Validation côté client (titre obligatoire, description, type)
  → requestService.creer(data)
      → POST /api/requests/ avec jeton JWT
      → Django valide les données, crée l'enregistrement en base
      → Statut initial : SUBMITTED
      → Retourne { id, titre, statut: "SUBMITTED", date_creation, ... }
  → navigate(`/requests/${id}`)
      → Affichage immédiat de la demande créée
```

### Changement de statut (gestionnaire)

```
Gestionnaire clique sur "Mettre en cours" (RequestDetailPage)
  → requestService.changerStatut(id, 'IN_PROGRESS')
      → PATCH /api/requests/:id/status/
      → Django vérifie la permission (IsGestionnaire)
      → Crée une entrée dans historique_statuts
      → Crée une notification pour le créateur de la demande
      → Retourne la demande mise à jour
  → Rechargement local des données de la demande
  → L'historique des statuts se met à jour dans l'interface
```

### Navigation par statut depuis le tableau de bord

```
Utilisateur clique sur la carte "Soumis" (DashboardPage)
  → navigate('/my-requests?status=SUBMITTED')

MyRequestsPage se monte
  → useSearchParams() lit le paramètre status=SUBMITTED
  → filterStatus initialisé à 'SUBMITTED'
  → filtered = requests.filter(r => r.statut === 'SUBMITTED')
  → pageTitle = 'Demandes soumises'
  → Lien retour "← Tableau de bord" affiché dans l'en-tête
```

### Marquage des notifications comme lues

```
Utilisateur ouvre une demande contenant des commentaires non lus
  → Les identifiants des commentaires lus sont stockés dans localStorage
     (clé : uqo_read_notifs, valeur : tableau d'identifiants JSON)
  → À chaque chargement, unreadFor(req) filtre les commentaires
     dont l'identifiant n'est pas dans l'ensemble des lus
  → La pastille "non lu" disparaît immédiatement côté client
```

---

## 14. Décisions techniques

### Interface sans bibliothèque de composants externe

L'interface est entièrement construite avec du CSS natif et des variables CSS (jetons de conception). Cette approche offre un contrôle total sur le rendu, évite les dépendances lourdes et leur superficie d'attaque, et garantit une cohérence visuelle parfaite avec la palette définie pour l'institution.

### Architecture sans réduction de la barre latérale

L'utilisateur navigue dans un système de gestion où la lisibilité est prioritaire. Une barre latérale statique de 240 px offre une meilleure expérience qu'une barre qui se réduit, éliminant les re-dispositions perturbant la lecture.

### Filtrage par statut dans l'URL

Le paramètre `?status=SUBMITTED` dans l'URL rend les vues filtrées partageables, compatibles avec le bouton Précédent du navigateur, et indexables. Cette décision évite également la création de cinq pages distinctes pour chaque statut, réduisant la duplication de code.

### Pied de page en dehors de `.app-body`

Pour qu'il soit réellement pleine largeur, le pied de page est un frère de `.app-body` dans l'arborescence DOM, non imbriqué dans le conteneur qui a `margin-left: 240px`. Le contenu intérieur est décalé avec `padding-left: 240px` pour demeurer lisible.

### Authentification à deux facteurs par courriel

Le choix d'une 2FA par courriel répond aux exigences de sécurité sans nécessiter d'application d'authentification tierce. Le code à 6 chiffres expire après 15 minutes et ne peut être utilisé qu'une seule fois, ce qui offre une protection contre les attaques par rejeu.

### Graphique donut sans bibliothèque de visualisation

Le graphique circulaire du tableau de bord est construit directement avec SVG et les propriétés `stroke-dasharray` / `strokeDashoffset`. Cette solution élimine une dépendance comme Recharts ou Chart.js pour un cas d'usage simple, réduisant la taille du paquet de production.

---

## 15. Évolutions possibles

| Fonctionnalité | Priorité | Description |
|---|---|---|
| Pièces jointes | Haute | Permettre d'attacher des fichiers aux demandes (PDF, images) |
| Notifications en temps réel | Haute | Remplacer l'interrogation périodique par WebSockets (Django Channels) |
| Synchronisation du profil | Moyenne | Sauvegarder les modifications du profil via l'API backend |
| Export PDF | Moyenne | Générer un récapitulatif imprimable d'une demande |
| Tableau de bord administrateur | Basse | Vue globale avec métriques avancées et filtres temporels |
| Application mobile | Basse | Interface React Native réutilisant la couche de services API |
| Recherche plein texte côté serveur | Moyenne | Utiliser les capacités FTS de PostgreSQL pour des résultats pertinents |
| Journalisation des accès | Basse | Traçabilité des connexions et des actions sensibles |

---

*Documentation rédigée dans le cadre du cours INF1743 — Groupe 12*  
*Université du Québec en Outaouais — Session Hiver 2026*
