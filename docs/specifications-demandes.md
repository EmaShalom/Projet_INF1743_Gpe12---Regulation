# Spécifications de la Gestion des Demandes

## Introduction
Ce document décrit en détail les règles métier pour la création, la modification et la consultation des demandes dans l'application UQO-Requests. Il couvre les sections 5.3, 5.4 et 5.5 du POF.

---

## 1. Création d'une Demande

### 1.1 Qui peut créer une demande ?
- ✅ **Utilisateur** (rôle utilisateur)
- ✅ **Gestionnaire** (rôle gestionnaire)
- ❌ **Utilisateur non authentifié** → Redirection vers `/login`

### 1.2 Accès au formulaire
**Route :** `/requests/new`

**Pré-requis :**
- Utilisateur authentifié (vérification par token JWT)
- Aucune autre restriction

### 1.3 Champs du formulaire

| Champ | Type | Obligatoire | Contraintes |
|-------|------|-------------|-------------|
| **Titre** | Texte | ✅ Oui | Min 5 caractères, Max 200 caractères |
| **Description** | Texte long | ✅ Oui | Min 20 caractères, Max 2000 caractères |
| **Type** | Sélection | ✅ Oui | Valeurs prédéfinies |

### 1.4 Types de demandes disponibles
```
- Technique
- Fonctionnalité
- Bug
- Question
- Amélioration
- Performance
- Autre
```

### 1.5 Validation côté client

**Titre :**
```javascript
if (!titre.trim()) {
  return "Le titre est requis";
}
if (titre.trim().length < 5) {
  return "Le titre doit contenir au moins 5 caractères";
}
if (titre.length > 200) {
  return "Le titre ne peut pas dépasser 200 caractères";
}
```

**Description :**
```javascript
if (!description.trim()) {
  return "La description est requise";
}
if (description.trim().length < 20) {
  return "La description doit contenir au moins 20 caractères";
}
if (description.length > 2000) {
  return "La description ne peut pas dépasser 2000 caractères";
}
```

**Type :**
```javascript
if (!type) {
  return "Le type est requis";
}
if (!TYPES_VALIDES.includes(type)) {
  return "Type de demande invalide";
}
```

### 1.6 Validation côté serveur

**⚠️ CRITIQUE :** Toutes les validations côté client doivent être **répétées côté serveur**.
```python
# Pseudo-code Django
def create_request(data, user):
    # Validation du titre
    if not data.get('titre') or len(data['titre'].strip()) < 5:
        return 400 Bad Request
    
    if len(data['titre']) > 200:
        return 400 Bad Request
    
    # Validation de la description
    if not data.get('description') or len(data['description'].strip()) < 20:
        return 400 Bad Request
    
    if len(data['description']) > 2000:
        return 400 Bad Request
    
    # Validation du type
    if data.get('type') not in TYPES_VALIDES:
        return 400 Bad Request
    
    # Création de la demande
    request = Request.objects.create(
        titre=data['titre'],
        description=data['description'],
        type=data['type'],
        statut='SUBMITTED',  # Statut initial TOUJOURS SUBMITTED
        createur=user,
        date_creation=now(),
        date_modification=now()
    )
    
    # Création de l'entrée d'historique
    StatusHistory.objects.create(
        demande=request,
        ancien_statut=None,
        nouveau_statut='SUBMITTED',
        modifie_par=user,
        date_changement=now(),
        commentaire='Demande créée'
    )
    
    return 201 Created, request
```

### 1.7 Comportement après création

**Attributs automatiques :**
- `statut` : Toujours `SUBMITTED`
- `createur` : L'utilisateur authentifié qui crée la demande
- `date_creation` : Timestamp actuel
- `date_modification` : Timestamp actuel (identique à date_creation)

**Création d'historique :**
- Une entrée d'historique est automatiquement créée :
  - `ancien_statut` : `null`
  - `nouveau_statut` : `SUBMITTED`
  - `modifie_par` : Créateur de la demande
  - `commentaire` : "Demande créée"

**Redirection :**
- Après succès (201 Created) → Rediriger vers `/dashboard`
- Afficher un message de succès : "Votre demande a été créée avec succès !"

### 1.8 Messages d'erreur

**Erreurs de validation :**
```json
{
  "titre": ["Le titre doit contenir au moins 5 caractères"],
  "description": ["La description est requise"],
  "type": ["Le type est requis"]
}
```

**Erreur serveur :**
```json
{
  "error": "Une erreur est survenue lors de la création de la demande"
}
```

---

## 2. Modification d'une Demande

### 2.1 Règles critiques de modification

⚠️ **RÈGLE #1 : Propriété**
Une demande ne peut être modifiée **QUE** par son créateur.

⚠️ **RÈGLE #2 : Statut**
Une demande ne peut être modifiée **QUE** si son statut est `SUBMITTED`.

⚠️ **RÈGLE #3 : Impossibilité après traitement**
Dès que le statut passe à `IN_PROGRESS`, `RESOLVED` ou `CLOSED`, la modification est **définitivement bloquée**.

### 2.2 Vérifications côté serveur
```python
# Pseudo-code de vérification
def can_modify_request(request, user):
    # Vérification 1 : L'utilisateur est-il le créateur ?
    if request.createur != user:
        return False, "Vous n'êtes pas autorisé à modifier cette demande"
    
    # Vérification 2 : Le statut permet-il la modification ?
    if request.statut != 'SUBMITTED':
        return False, "Cette demande ne peut plus être modifiée car elle est en cours de traitement"
    
    return True, None

# Utilisation
def update_request(request_id, data, user):
    request = get_object_or_404(Request, id=request_id)
    
    can_modify, error_message = can_modify_request(request, user)
    if not can_modify:
        return 403 Forbidden, {"error": error_message}
    
    # Procéder à la modification
    request.titre = data.get('titre', request.titre)
    request.description = data.get('description', request.description)
    request.type = data.get('type', request.type)
    request.date_modification = now()
    request.save()
    
    return 200 OK, request
```

### 2.3 Champs modifiables

| Champ | Modifiable ? | Contraintes |
|-------|--------------|-------------|
| **Titre** | ✅ Oui | Mêmes règles que création |
| **Description** | ✅ Oui | Mêmes règles que création |
| **Type** | ✅ Oui | Mêmes règles que création |
| **Statut** | ❌ Non | Réservé au gestionnaire |
| **Créateur** | ❌ Non | Immuable |
| **Dates** | ❌ Non | Automatiques |

### 2.4 Interface utilisateur

**Affichage du bouton "Modifier" :**
- ✅ Affiché si `statut === 'SUBMITTED'` ET `createur === utilisateur_actuel`
- ❌ Masqué ou désactivé sinon

**Message si modification impossible :**
```
"Cette demande ne peut plus être modifiée car elle est en cours de traitement."
```

### 2.5 Cas d'usage

**Scénario 1 : Modification autorisée**
```
1. Alice crée une demande → statut = SUBMITTED
2. Alice accède au détail de sa demande
3. Bouton "Modifier" visible et actif
4. Alice modifie le titre et la description
5. Soumission → 200 OK
6. date_modification mise à jour
7. Redirection vers le détail de la demande
```

**Scénario 2 : Modification bloquée (statut)**
```
1. Alice crée une demande → statut = SUBMITTED
2. Le gestionnaire change le statut → statut = IN_PROGRESS
3. Alice accède au détail de sa demande
4. Bouton "Modifier" absent ou désactivé
5. Message : "Cette demande ne peut plus être modifiée..."
```

**Scénario 3 : Modification bloquée (propriétaire)**
```
1. Alice crée une demande
2. Bob (autre utilisateur) accède au détail via l'URL
3. Le serveur vérifie : Bob != Alice
4. 403 Forbidden
5. Message : "Vous n'êtes pas autorisé à modifier cette demande"
```

### 2.6 Codes HTTP

| Situation | Code | Message |
|-----------|------|---------|
| Modification réussie | 200 OK | "Demande modifiée avec succès" |
| Statut ≠ SUBMITTED | 400 Bad Request | "Cette demande ne peut plus être modifiée" |
| Non propriétaire | 403 Forbidden | "Vous n'êtes pas autorisé..." |
| Demande introuvable | 404 Not Found | "Demande introuvable" |
| Données invalides | 400 Bad Request | Détails des erreurs de validation |

---

## 3. Consultation des Demandes

### 3.1 Liste des demandes (Tableau de bord)

**Route :** `/dashboard`

**Règles d'affichage :**

**Pour un utilisateur (rôle utilisateur) :**
```python
# Ne voir QUE ses propres demandes
requests = Request.objects.filter(createur=user)
```

**Pour un gestionnaire (rôle gestionnaire) :**
```python
# Voir TOUTES les demandes du système
requests = Request.objects.all()
```

**Informations affichées (minimum) :**
- Titre
- Type
- Statut (avec badge coloré)
- Date de création
- Date de dernière modification

**Tri par défaut :**
- Du plus récent au plus ancien (par `date_creation DESC`)

### 3.2 Détail d'une demande

**Route :** `/requests/:id`

**Règles d'accès :**

**Pour un utilisateur (rôle utilisateur) :**
```python
# Peut voir UNIQUEMENT ses propres demandes
request = get_object_or_404(Request, id=request_id)

if request.createur != user:
    return 403 Forbidden
```

**Pour un gestionnaire (rôle gestionnaire) :**
```python
# Peut voir TOUTES les demandes
request = get_object_or_404(Request, id=request_id)
# Pas de vérification supplémentaire
```

**Informations affichées :**
- Toutes les informations de la demande
- Tous les commentaires (liste chronologique)
- Tout l'historique des changements de statut

**Actions disponibles :**
- **Pour l'utilisateur créateur :**
  - Modifier (si statut = SUBMITTED)
  - Ajouter un commentaire
- **Pour le gestionnaire :**
  - Changer le statut
  - Ajouter un commentaire de traitement
  - Clôturer la demande

---

## 4. Règles de Sécurité

### 4.1 Authentification
**Toutes les opérations** sur les demandes nécessitent une authentification valide.

### 4.2 Autorisation (Propriété)
**Vérification systématique :**
```python
def check_ownership(request, user):
    if request.createur != user and user.role != 'gestionnaire':
        raise PermissionDenied("Accès refusé")
```

### 4.3 Validation des transitions
```python
def validate_status_transition(old_status, new_status):
    ALLOWED_TRANSITIONS = {
        'SUBMITTED': ['IN_PROGRESS'],
        'IN_PROGRESS': ['RESOLVED'],
        'RESOLVED': ['CLOSED'],
        'CLOSED': []
    }
    
    if new_status not in ALLOWED_TRANSITIONS.get(old_status, []):
        raise ValidationError(
            f"Transition {old_status} → {new_status} interdite"
        )
```

### 4.4 Protection contre les injections
- Utiliser les fonctionnalités ORM (pas de requêtes SQL brutes)
- Django échappe automatiquement les templates
- Ne jamais exécuter de code fourni par l'utilisateur

---

## 5. Messages d'Erreur Standardisés

### 5.1 Erreurs de création

| Cas | Message |
|-----|---------|
| Titre vide | "Le titre est requis" |
| Titre trop court | "Le titre doit contenir au moins 5 caractères" |
| Titre trop long | "Le titre ne peut pas dépasser 200 caractères" |
| Description vide | "La description est requise" |
| Description trop courte | "La description doit contenir au moins 20 caractères" |
| Description trop longue | "La description ne peut pas dépasser 2000 caractères" |
| Type manquant | "Le type est requis" |
| Type invalide | "Type de demande invalide" |

### 5.2 Erreurs de modification

| Cas | Code HTTP | Message |
|-----|-----------|---------|
| Non propriétaire | 403 | "Vous n'êtes pas autorisé à modifier cette demande" |
| Statut ≠ SUBMITTED | 400 | "Cette demande ne peut plus être modifiée car elle est en cours de traitement" |
| Demande inexistante | 404 | "Demande introuvable" |

### 5.3 Erreurs de consultation

| Cas | Code HTTP | Message |
|-----|-----------|---------|
| Non authentifié | 401 | "Authentification requise" |
| Accès refusé | 403 | "Vous n'avez pas accès à cette demande" |
| Demande inexistante | 404 | "Demande introuvable" |

---

## 6. Cas d'Usage Complets

### 6.1 Cycle de vie complet d'une demande
```
JOUR 1, 10h00
- Alice (utilisateur) crée une demande "Problème de connexion"
- Titre: "Problème de connexion au système"
- Description: "Je ne parviens pas à me connecter..."
- Type: "Technique"
- → Statut: SUBMITTED
- → Créateur: Alice (id=1)
- → Entrée d'historique créée (null → SUBMITTED)

JOUR 1, 10h05
- Alice consulte sa demande sur /requests/42
- Elle voit le détail complet
- Le bouton "Modifier" est visible

JOUR 1, 10h10
- Alice modifie la description (ajoute des détails)
- → 200 OK
- → date_modification mise à jour

JOUR 1, 14h00
- Marie (gestionnaire) consulte toutes les demandes
- Elle voit la demande d'Alice
- Elle change le statut: SUBMITTED → IN_PROGRESS
- → Entrée d'historique créée (SUBMITTED → IN_PROGRESS)

JOUR 1, 14h05
- Alice consulte sa demande
- Le bouton "Modifier" n'est plus visible
- Message: "Cette demande ne peut plus être modifiée..."

JOUR 2, 16h00
- Marie résout le problème
- Elle change le statut: IN_PROGRESS → RESOLVED

JOUR 3, 09h00
- Marie clôture la demande: RESOLVED → CLOSED
- → Statut final: CLOSED
```

### 6.2 Tentative de modification non autorisée
```
UTILISATEUR : Alice (id=1)
DEMANDE : #42 créée par Bob (id=2)

Alice tente d'accéder à /requests/42/edit

SERVEUR :
1. Récupère la demande #42
2. Vérifie : request.createur (Bob) != Alice
3. Retourne 403 Forbidden
4. Message: "Vous n'êtes pas autorisé..."

FRONTEND :
- Affiche un message d'erreur
- Redirige vers /dashboard
```

---

## 7. Implémentation API (L2)

### 7.1 Endpoints

| Méthode | Route | Action | Auth | Permissions |
|---------|-------|--------|------|-------------|
| POST | `/api/requests/` | Créer | ✅ | Tous |
| GET | `/api/requests/` | Lister | ✅ | Filtré par rôle |
| GET | `/api/requests/:id/` | Détail | ✅ | Propriétaire ou gestionnaire |
| PUT | `/api/requests/:id/` | Modifier | ✅ | Propriétaire + statut SUBMITTED |
| PATCH | `/api/requests/:id/status/` | Changer statut | ✅ | Gestionnaire uniquement |

### 7.2 Exemple de requête de création
```http
POST /api/requests/ HTTP/1.1
Host: api.uqo-requests.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "titre": "Problème de connexion au système",
  "description": "Je ne parviens pas à me connecter depuis ce matin. Le message d'erreur indique 'Identifiants invalides' alors que je suis certain d'utiliser le bon mot de passe.",
  "type": "Technique"
}
```

### 7.3 Réponse de succès (201 Created)
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 42,
  "titre": "Problème de connexion au système",
  "description": "Je ne parviens pas à me connecter...",
  "type": "Technique",
  "statut": "SUBMITTED",
  "createur": {
    "id": 1,
    "nom_complet": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "role": "utilisateur"
  },
  "date_creation": "2026-01-28T15:30:00Z",
  "date_modification": "2026-01-28T15:30:00Z"
}
```

---

## 8. Tests à Effectuer

### 8.1 Tests de création
- [ ] Création avec données valides → 201 Created
- [ ] Création avec titre vide → 400 Bad Request
- [ ] Création avec titre < 5 caractères → 400
- [ ] Création avec description < 20 caractères → 400
- [ ] Création sans type → 400
- [ ] Vérifier que statut initial = SUBMITTED
- [ ] Vérifier que l'historique est créé

### 8.2 Tests de modification
- [ ] Modification par le créateur (statut SUBMITTED) → 200 OK
- [ ] Modification par un autre utilisateur → 403 Forbidden
- [ ] Modification avec statut IN_PROGRESS → 400 Bad Request
- [ ] Modification avec statut RESOLVED → 400
- [ ] Modification avec statut CLOSED → 400
- [ ] Vérifier que date_modification est mise à jour

### 8.3 Tests de consultation
- [ ] Utilisateur voit uniquement ses demandes
- [ ] Gestionnaire voit toutes les demandes
- [ ] Utilisateur ne peut pas accéder aux demandes d'autrui → 403
- [ ] Demande inexistante → 404 Not Found

---

## 9. Diagramme de Flux
```
┌─────────────────────────────────────────────────────────┐
│               CYCLE DE VIE D'UNE DEMANDE                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. CRÉATION                                            │
│     • Utilisateur remplit formulaire                    │
│     • Validation client + serveur                       │
│     • Statut initial: SUBMITTED                         │
│     • Créateur: utilisateur actuel                      │
│     • Historique créé                                   │
│                                                         │
│  2. MODIFICATION (si statut = SUBMITTED)                │
│     • Uniquement par le créateur                        │
│     • Modification: titre, description, type            │
│     • date_modification mise à jour                     │
│                                                         │
│  3. TRAITEMENT (par gestionnaire)                       │
│     • Changement de statut → IN_PROGRESS                │
│     • Modification bloquée pour le créateur             │
│     • Ajout de commentaires possibles                   │
│                                                         │
│  4. RÉSOLUTION (par gestionnaire)                       │
│     • Changement de statut → RESOLVED                   │
│     • Demande traitée                                   │
│                                                         │
│  5. CLÔTURE (par gestionnaire)                          │
│     • Changement de statut → CLOSED                     │
│     • Statut final (définitif)                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Références
- POF Section 5.3 : Création d'une demande
- POF Section 5.4 : Modification d'une demande
- POF Section 5.5 : Consultation du détail d'une demande
- POF Section 5.9 : Gestion des erreurs et des accès non autorisés
- docs/statuts.md : Statuts et transitions
- docs/roles.md : Rôles et permissions
