## 📁 Structure du Projet

### Arborescence complète

```
uqo-requests/
├── frontend/                      # Application React (Livrable L1)
│   ├── public/                    # Fichiers publics statiques
│   │   ├── vite.svg              # Favicon
│   │   └── .gitkeep
│   │
│   ├── src/                       # Code source React
│   │   ├── components/            # Composants réutilisables
│   │   │   ├── Navbar.jsx        # Barre de navigation (U6)
│   │   │   ├── Navbar.css
│   │   │   ├── Button.jsx        # Bouton réutilisable (U9)
│   │   │   ├── Button.css
│   │   │   ├── Card.jsx          # Carte réutilisable (U9)
│   │   │   ├── Card.css
│   │   │   └── ...
│   │   │
│   │   ├── pages/                 # Pages de l'application
│   │   │   ├── LoginPage.jsx     # Page connexion (U2)
│   │   │   ├── LoginPage.css
│   │   │   ├── RegisterPage.jsx  # Page inscription (U1)
│   │   │   ├── RegisterPage.css
│   │   │   ├── DashboardPage.jsx # Tableau de bord (U3)
│   │   │   ├── DashboardPage.css
│   │   │   ├── RequestDetailPage.jsx  # Détail demande (U4)
│   │   │   ├── RequestDetailPage.css
│   │   │   ├── CreateRequestPage.jsx  # Création (U5)
│   │   │   ├── CreateRequestPage.css
│   │   │   └── ...
│   │   │
│   │   ├── context/               # Context API (état global)
│   │   │   ├── AuthContext.jsx   # Contexte authentification (U8)
│   │   │   └── ...
│   │   │
│   │   ├── hooks/                 # Custom hooks React
│   │   │   ├── useAuth.js        # Hook authentification
│   │   │   ├── useRequests.js    # Hook demandes
│   │   │   └── ...
│   │   │
│   │   ├── utils/                 # Fonctions utilitaires (CHEF)
│   │   │   ├── constants.js      # Constantes globales
│   │   │   ├── validators.js     # Fonctions de validation
│   │   │   ├── formatters.js     # Fonctions de formatage
│   │   │   └── ...
│   │   │
│   │   ├── styles/                # Styles globaux (CHEF)
│   │   │   ├── variables.css     # Variables CSS
│   │   │   ├── global.css        # Styles globaux (U10)
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx                # Composant racine (CHEF + U7)
│   │   ├── App.css                # Styles App
│   │   ├── main.jsx               # Point d'entrée (CHEF)
│   │   └── mockData.js            # Données mockées L1 (CHEF)
│   │
│   ├── index.html                 # Page HTML principale (CHEF)
│   ├── package.json               # Dépendances npm (CHEF)
│   ├── vite.config.js             # Configuration Vite (CHEF)
│   └── .gitignore                 # Fichiers à ignorer
│
├── backend/                       # Application Django (Livrable L2)
│   ├── api/                       # Application Django principale
│   │   ├── models.py             # Modèles de données
│   │   ├── serializers.py        # Sérialiseurs DRF
│   │   ├── views.py              # Vues/Endpoints API
│   │   ├── urls.py               # Routes API
│   │   └── permissions.py        # Permissions personnalisées
│   │
│   ├── uqo_requests/             # Configuration Django
│   │   ├── settings.py           # Paramètres du projet
│   │   ├── urls.py               # URLs racine
│   │   └── wsgi.py               # Point d'entrée WSGI
│   │
│   ├── manage.py                 # Utilitaire Django
│   ├── requirements.txt          # Dépendances Python
│   └── .env                      # Variables d'environnement
│
├── docs/                          # Documentation du projet
│   ├── parcours-non-authentifie.md      # A1 - Membre 1
│   ├── parcours-utilisateur-authentifie.md  # A2 - Membre 2
│   ├── roles.md                          # A3 - Membre 3
│   ├── permissions-matrix.md             # A3.1 - Membre 3
│   ├── statuts.md                        # A4 - Membre 4
│   ├── architecture.md                   # A5 + A5.1 - Membre 5
│   ├── entites.md                        # A6 - Membre 6
│   ├── specifications-inscription.md     # A7 - Membre 7
│   └── specifications-demandes.md        # A8 - Membre 8
│
├── .gitignore                     # Fichiers à ignorer (Git)
├── README.md                      # Documentation principale (CHEF)
└── LICENSE                        # Licence du projet
```

---

### Organisation par Livrable

**Livrable L1 (Frontend uniquement) :**
```
uqo-requests/
├── frontend/         ✅ Complet
│   ├── src/
│   │   ├── pages/    ✅ Toutes les pages React
│   │   ├── components/ ✅ Composants réutilisables
│   │   ├── context/  ✅ AuthContext
│   │   ├── utils/    ✅ Utilitaires
│   │   └── styles/   ✅ CSS global
│   └── ...
├── docs/             ✅ 9 documents
└── README.md         ✅ Documentation complète
```

**Livrable L2 (Backend + intégration) :**
```
uqo-requests/
├── frontend/         ✅ (L1) + modifications API
├── backend/          🆕 Django REST API
│   ├── api/         🆕 Endpoints REST
│   └── ...
└── docs/            ✅ Mis à jour
```

**Livrable L3 (Déploiement) :**
```
uqo-requests/
├── frontend/         ✅ Build de production
├── backend/          ✅ Configuration production
├── docker-compose.yml 🆕 Orchestration
├── .github/
│   └── workflows/   🆕 CI/CD
└── docs/            ✅ Guide de déploiement
```

---

### Conventions de Nommage

**Fichiers React :**
- Composants : `PascalCase.jsx` (ex: `LoginPage.jsx`)
- Styles : `PascalCase.css` (ex: `LoginPage.css`)
- Hooks : `camelCase.js` avec préfixe `use` (ex: `useAuth.js`)
- Utilitaires : `camelCase.js` (ex: `validators.js`)

**Dossiers :**
- `lowercase` (ex: `components/`, `pages/`)

**Constantes :**
- `SCREAMING_SNAKE_CASE` (ex: `REQUEST_STATUS`)

**Variables et fonctions :**
- `camelCase` (ex: `isLoading`, `handleSubmit`)

**Composants React :**
- `PascalCase` (ex: `LoginPage`, `Navbar`)

---

### Description des Dossiers

**`frontend/src/components/`**
- Composants React **réutilisables** utilisés dans plusieurs pages
- Exemples : Navbar, Button, Card, Modal, Spinner
- Chaque composant = 1 fichier .jsx + 1 fichier .css

**`frontend/src/pages/`**
- Composants React représentant des **pages complètes**
- Une page = une route dans React Router
- Exemples : LoginPage, DashboardPage, RequestDetailPage

**`frontend/src/context/`**
- Context API pour **état global** partagé entre composants
- Exemple : AuthContext (utilisateur connecté, token JWT)

**`frontend/src/hooks/`**
- **Custom hooks** React pour logique réutilisable
- Exemples : useAuth (gestion auth), useRequests (gestion demandes)

**`frontend/src/utils/`**
- Fonctions **utilitaires** pures (sans dépendance React)
- Exemples : validators (validation), formatters (formatage dates)

**`frontend/src/styles/`**
- Styles **globaux** appliqués à toute l'application
- variables.css : Variables CSS (couleurs, espacements)
- global.css : Reset CSS + classes utilitaires

**`backend/api/`**
- Application Django contenant la **logique métier**
- models.py : Modèles de données (User, Request, Comment)
- views.py : Vues/Endpoints API REST
- serializers.py : Transformation Python ↔ JSON

**`docs/`**
- Documentation **Markdown** du projet
- 9 documents pour le Livrable L1 (A1 à A8)
- Mis à jour pour L2 et L3

---

### Fichiers Importants

**`frontend/package.json`**
- **Dépendances npm** du projet React
- Scripts de build et développement
- Créé par le chef de groupe

**`frontend/vite.config.js`**
- **Configuration Vite** (build tool)
- Port du serveur de développement (5173)
- Plugins (React)

**`frontend/src/App.jsx`**
- **Composant racine** de l'application
- Configuration de React Router
- Routes de toutes les pages

**`frontend/src/main.jsx`**
- **Point d'entrée** de l'application React
- Rendu du composant App dans le DOM
- Import des styles globaux

**`frontend/src/mockData.js`**
- **Données mockées** pour le Livrable L1
- Utilisateurs, demandes, commentaires simulés
- Remplacé par API au L2

**`backend/requirements.txt`**
- **Dépendances Python** du projet Django
- Installées via `pip install -r requirements.txt`

**`backend/manage.py`**
- **Utilitaire Django** pour gérer le projet
- Commandes : runserver, migrate, createsuperuser

**`.gitignore`**
- Fichiers à **ne pas versionner** avec Git
- Exemples : node_modules/, .env, __pycache__/

**`README.md`**
- **Documentation principale** visible sur GitHub
- Instructions d'installation et utilisation
- Informations sur le projet et l'équipe

---

### Flux de Développement

**1. Développement d'une nouvelle page (exemple : LoginPage)**

```bash
# 1. Créer la branche
git checkout -b feat/u2-login-page

# 2. Créer les fichiers
cd frontend/src/pages
touch LoginPage.jsx LoginPage.css

# 3. Coder le composant (LoginPage.jsx)
# - Importer React, hooks, utils
# - Créer le composant
# - Exporter par défaut

# 4. Ajouter les styles (LoginPage.css)
# - Utiliser les variables CSS
# - Design responsive

# 5. Ajouter la route (App.jsx)
import LoginPage from './pages/LoginPage'
<Route path="/login" element={<LoginPage />} />

# 6. Tester
npm run dev

# 7. Commit et push
git add frontend/src/pages/LoginPage.*
git add frontend/src/App.jsx
git commit -m "feat(U2): Create login page"
git push origin feat/u2-login-page

# 8. Créer Pull Request sur GitHub
```

**2. Développement d'un composant réutilisable (exemple : Button)**

```bash
# Créer dans components/ (pas pages/)
cd frontend/src/components
touch Button.jsx Button.css

# Le composant accepte des props
export default function Button({ onClick, children, variant }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}

# Utilisation dans une page
import Button from '../components/Button'

<Button variant="primary" onClick={handleSubmit}>
  Se connecter
</Button>
```

---

### Taille du Projet

**Livrable L1 (Frontend uniquement) :**
- Fichiers JavaScript/JSX : ~25 fichiers
- Fichiers CSS : ~15 fichiers
- Lignes de code : ~3000-4000 lignes
- Documentation : ~2500 lignes (9 fichiers)

**Livrable L2 (Backend ajouté) :**
- Total fichiers : ~50 fichiers
- Lignes de code : ~8000-10000 lignes
- Tables PostgreSQL : 4 tables

**Livrable L3 (Déploiement) :**
- Configuration déploiement : +10 fichiers
- Documentation déploiement : +500 lignes