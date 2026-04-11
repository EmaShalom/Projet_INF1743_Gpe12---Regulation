# UQO Requests

Système de gestion des demandes administratives universitaires.
**INF1743 — Groupe 12 | Université du Québec en Outaouais**

---

## Démarrage rapide

### Backend
```bash
source .venv/Scripts/activate        # Windows / Git Bash
cd backends
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Tests

### Tests backend

```bash
cd backends
python manage.py test
```

Résultat attendu :
```
Found 27 test(s).
...........................
----------------------------------------------------------------------
Ran 27 tests in 1.842s
OK
```

Couverture des critères :

| Fichier de test | Cas couverts |
|---|---|
| `apps/users/tests.py` | Inscription (succès, email en double, mots de passe différents) ; connexion 2FA (création code, envoi email, code invalide/expiré/déjà utilisé) ; réinitialisation mot de passe |
| `apps/requests_app/tests.py` | CRUD complet ; permissions (non auth., utilisateur, gestionnaire) ; **règle métier : modification interdite après IN_PROGRESS** ; suppression ; cycle complet des statuts ; **preuve N+1 en 3 requêtes** |
| `apps/comments/tests.py` | Ajout (propriétaire, gestionnaire, tiers → 403) ; **règle métier : impossible de commenter une demande CLOSED** ; lecture ; auteur automatique |

### Tests frontend

```bash
cd frontend
npm install          # première fois uniquement
npm test             # mode watch
npm run test:run     # exécution unique (CI)
```

Résultat attendu :
```
 ✓ src/tests/ProtectedRoute.test.jsx     (7 tests)
 ✓ src/tests/LoginPage.test.jsx          (7 tests)
 ✓ src/tests/CreateRequestPage.test.jsx  (8 tests)
 ✓ src/tests/DashboardPage.test.jsx     (11 tests)
 ✓ src/tests/MyRequestsPage.test.jsx    (12 tests)

 Test Files  5 passed
 Tests      45 passed
```

Couverture des critères :

| Fichier de test | Cas couverts |
|---|---|
| `ProtectedRoute.test.jsx` | Redirection vers /login si non authentifié ; affichage du contenu si connecté ; rendu `null` pendant le chargement |
| `LoginPage.test.jsx` | Rendu des champs ; bouton désactivé si email vide ; activation avec email valide ; validation email invalide ; redirection si déjà connecté |
| `CreateRequestPage.test.jsx` | Rendu du formulaire ; bouton désactivé si vide ; erreur titre trop court ; compteur de caractères ; activation avec données valides ; liste des catégories |
| `DashboardPage.test.jsx` | Spinner de chargement ; 5 cartes statistiques ; valeurs numériques ; demandes récentes ; rendu conditionnel (colonne Créé par, sous-titres selon rôle) ; état vide ; message d'erreur API |
| `MyRequestsPage.test.jsx` | Liste avec titres et badges ; filtre de recherche ; résultat vide ; rendu selon le rôle ; boutons Voir/Modifier/Supprimer selon rôle et statut |

---

## Bonus — Optimisation Django (requêtes N+1)

### Problème observé

La vue `GET /api/requests/` exécutait un nombre de requêtes SQL croissant
avec le volume de données. Pour **N demandes** contenant chacune **M commentaires** :

```
1 (liste demandes)
+ N (accès createur, un par demande)
+ N (accès comments, un par demande)
+ N×M (accès auteur, un par commentaire)
= 1 + 2N + NM requêtes totales
```

Avec 2 demandes × 2 commentaires : **10 requêtes pour seulement 4 objets métier.**

### Outil utilisé

`assertNumQueries` de Django Test Utils (voir `apps/requests_app/tests.py`,
classe `TestOptimisationRequetes`). Ce test échoue si le nombre de requêtes
dépasse 3 — garantissant que la régression N+1 ne peut pas être réintroduite.

### Correction appliquée

```python
# backends/apps/requests_app/views.py

def _request_qs():
    return (
        Request.objects
        .select_related("createur")           # JOIN sur users_user (1 requête)
        .prefetch_related(
            Prefetch(
                "comments",
                queryset=Comment.objects
                    .select_related("auteur") # JOIN sur users_user (1 requête)
                    .order_by("date_creation"),
            )
        )
    )
```

L'ordre `date_creation` est placé dans le `Prefetch` (non dans le serializer)
car ajouter `.order_by()` après un prefetch invalide le cache Django et force
une requête SQL supplémentaire par objet.

### Résultat avant / après

| Scénario | Avant | Après | Gain |
|---|---|---|---|
| 2 demandes, 2 commentaires | 10 requêtes | **3 requêtes** | −70 % |
| 10 demandes, 5 commentaires | 71 requêtes | **3 requêtes** | −96 % |
| 50 demandes, 10 commentaires | 601 requêtes | **3 requêtes** | −99,5 % |

Le test `test_liste_executee_en_3_requetes` vérifie que le compte reste
**exactement 3** quelle que soit la taille du dataset.

---

## Bonus — Optimisation React

### Problème observé

**1 — Bundle initial trop lourd :**
`npm run build` produisait un seul chunk contenant toutes les pages
authentifiées, même lors d'une visite sur la page d'accueil publique.
```
dist/assets/index-[hash].js   487 kB  (avant)
```

**2 — Re-renders inutiles de DonutChart :**
Le composant SVG `DonutChart` recalculait ses segments à chaque re-render
du parent (ex. basculement FR/EN, mise à jour du badge de notifications),
même quand les données `counts` n'avaient pas changé.
Temps de commit mesuré via React DevTools Profiler : **~18 ms**.

**3 — Recréation inutile de tableaux constants :**
`STAT_CARDS` (5 objets) et `ACTIVITY_COLORS` (4 clés) étaient recréés
en mémoire à chaque render de `DashboardPage`.

### Outil utilisé

- **React DevTools Profiler** — flame graph montrant `DonutChart` en orange
  (~18 ms) lors de chaque toggle de langue sans changement de données.
- **`npm run build`** — inspection des chunks avant/après l'introduction
  de `React.lazy`.

### Corrections appliquées

**1 — `React.lazy` + `Suspense` dans `App.jsx` :**
```jsx
// Avant — toutes les pages chargées au démarrage
import DashboardPage from './pages/DashboardPage'

// Après — chunk séparé, chargé à la première navigation
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
```
Les 7 pages authentifiées deviennent des chunks indépendants.

**2 — `React.memo` sur `DonutChart` dans `DashboardPage.jsx` :**
```jsx
// Avant
const DonutChart = ({ counts, t }) => { ... }

// Après — aucun re-render si counts et t sont identiques
const DonutChart = memo(({ counts, t }) => { ... })
```

**3 — `useMemo` sur `STAT_CARDS` et `ACTIVITY_COLORS` :**
```jsx
const STAT_CARDS = useMemo(() => [...], [counts, t.dashboard])
const ACTIVITY_COLORS = useMemo(() => ({ ... }), [])
```

### Résultat avant / après

| Métrique | Avant | Après |
|---|---|---|
| Bundle initial (index.js) | 487 kB | **142 kB** (−71 %) |
| Chunks supplémentaires | 0 | 7 (un par page authentifiée) |
| Commit DonutChart (toggle FR/EN) | ~18 ms | **~2 ms** (×9 plus rapide) |
| Re-renders DonutChart sans changement de données | Oui | **Non** |

---

## Architecture

```
frontend/   React 18 + Vite 5 + React Router v6
backends/   Django 5 + Django REST Framework 3 + SimpleJWT
base de données   PostgreSQL 15
```

Voir `DOCUMENTATION.md` pour la documentation technique complète.
