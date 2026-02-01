# Parcours Utilisateur Authentifié

## 📋 Introduction

Un utilisateur **authentifié** est une personne qui s'est connectée à l'application UQO-Requests avec succès et possède un **token JWT valide** stocké dans son navigateur.

Ce document décrit :
- Les pages accessibles après connexion
- Les actions disponibles selon le rôle
- Les restrictions par rôle (utilisateur vs gestionnaire)
- Le processus de déconnexion

---

## 🔐 Après la Connexion

### Étape 1 : Authentification réussie

Lorsqu'un utilisateur se connecte avec succès :

1. **Token JWT généré** par le serveur (L2) ou simulé (L1)
2. **Token stocké** dans `localStorage` du navigateur
3. **Informations utilisateur** stockées dans `AuthContext` :
   - ID utilisateur
   - Nom complet
   - Email
   - Rôle (utilisateur ou gestionnaire)
4. **Redirection automatique** vers `/dashboard`

### Étape 2 : Accès aux pages protégées

L'utilisateur peut maintenant accéder à toutes les pages protégées. Le composant `ProtectedRoute` vérifie la présence du token JWT avant d'autoriser l'accès.

---

## 🌐 Pages Accessibles (Authentifié)

Un utilisateur authentifié peut accéder à **4 pages principales** :

### 1. Tableau de bord (`/dashboard`)

**URL :** `http://localhost:5173/dashboard`

**Description :** Page d'accueil de l'utilisateur connecté. Affiche la liste de ses demandes.

**Accès automatique après :**
- Connexion réussie
- Clic sur le logo UQO-Requests
- Clic sur "Tableau de bord" dans la navigation

**Contenu affiché :**

**Pour un UTILISATEUR :**
- Liste de **ses propres demandes** uniquement
- Bouton "Nouvelle demande" (en haut à droite)
- Filtre par statut (Tous, Soumis, En cours, Résolu, Fermé)
- Recherche par titre
- Tri (Date création, Date modification, Titre)

**Pour un GESTIONNAIRE :**
- Liste de **toutes les demandes** de tous les utilisateurs
- Bouton "Nouvelle demande"
- Mêmes filtres et recherche
- Indicateur du nombre total de demandes

**Informations affichées par demande :**
- Titre de la demande
- Type (Badge coloré : Technique, Bug, Fonctionnalité, etc.)
- Statut (Badge coloré : Soumis, En cours, Résolu, Fermé)
- Créateur (nom complet)
- Date de création
- Date de dernière modification

**Actions disponibles :**
- Cliquer sur une demande → Redirection vers `/requests/:id`
- Cliquer sur "Nouvelle demande" → Redirection vers `/requests/new`

---

### 2. Détail d'une demande (`/requests/:id`)

**URL :** `http://localhost:5173/requests/1` (exemple)

**Description :** Affiche les détails complets d'une demande spécifique.

**Accès :**
- Clic sur une demande dans le tableau de bord
- URL directe (si l'utilisateur a les permissions)

**Contenu affiché :**

**Informations de la demande :**
- Titre
- Description complète
- Type
- Statut (avec badge coloré)
- Créateur (nom + date de création)
- Date de dernière modification

**Section Commentaires :**
- Liste de tous les commentaires
- Chaque commentaire affiche :
  - Auteur (nom complet)
  - Date et heure
  - Contenu du commentaire
- Formulaire pour ajouter un nouveau commentaire (si permissions)

**Section Historique :**
- Liste chronologique des changements de statut
- Chaque entrée affiche :
  - Ancien statut → Nouveau statut
  - Personne ayant fait le changement
  - Date et heure du changement

**Actions disponibles :**

**Pour un UTILISATEUR (propriétaire de la demande) :**
- ✅ Consulter tous les détails
- ✅ Ajouter des commentaires
- ✅ Modifier la demande **SI statut = SUBMITTED**
- ❌ **NE PEUT PAS** changer le statut
- ❌ **NE PEUT PAS** modifier si statut ≠ SUBMITTED

**Pour un GESTIONNAIRE :**
- ✅ Consulter tous les détails
- ✅ Ajouter des commentaires
- ✅ **Changer le statut** (SUBMITTED → IN_PROGRESS → RESOLVED → CLOSED)
- ✅ Voir toutes les demandes (pas seulement les siennes)

**Pour un UTILISATEUR (non propriétaire) :**
- ❌ **ACCÈS REFUSÉ** → Redirection vers `/dashboard`
- Message : "Vous n'avez pas accès à cette demande"

---

### 3. Création de demande (`/requests/new`)

**URL :** `http://localhost:5173/requests/new`

**Description :** Formulaire pour créer une nouvelle demande.

**Accès :**
- Bouton "Nouvelle demande" sur le tableau de bord
- URL directe

**Formulaire (3 champs) :**

| Champ | Type | Validation |
|-------|------|------------|
| **Titre** | Texte | Requis, 5-200 caractères |
| **Description** | Textarea | Requise, 20-2000 caractères |
| **Type** | Select | Requis, parmi : Technique, Bug, Fonctionnalité, Question, Amélioration, Performance, Autre |

**Validation en temps réel :**
- Titre vide → "Le titre est requis"
- Titre < 5 caractères → "Le titre doit contenir au moins 5 caractères"
- Titre > 200 caractères → "Le titre ne peut pas dépasser 200 caractères"
- Description vide → "La description est requise"
- Description < 20 caractères → "La description doit contenir au moins 20 caractères"
- Description > 2000 caractères → "La description ne peut pas dépasser 2000 caractères"
- Type non sélectionné → "Le type est requis"

**Compteurs de caractères :**
- Affichage en temps réel : "45/200 caractères" pour le titre
- Affichage en temps réel : "150/2000 caractères" pour la description

**État du bouton :**
- Formulaire invalide → Bouton "Créer" désactivé (grisé)
- Formulaire valide → Bouton "Créer" activé

**Après soumission réussie :**
1. Spinner de chargement affiché
2. Demande créée avec statut = **SUBMITTED** automatiquement
3. Redirection vers `/requests/:id` (la nouvelle demande)
4. Message de succès affiché : "Votre demande a été créée avec succès !"

**Permissions :**
- ✅ Tous les utilisateurs authentifiés peuvent créer une demande
- ✅ Gestionnaires peuvent aussi créer des demandes

---

### 4. Modification de demande (`/requests/:id/edit`)

**URL :** `http://localhost:5173/requests/1/edit` (exemple)

**Description :** Formulaire pour modifier une demande existante.

**Accès :**
- Bouton "Modifier" sur la page de détail (si permissions)

**Permissions strictes :**

**Pour un UTILISATEUR :**
- ✅ Peut modifier **SEULEMENT** :
  - Ses propres demandes
  - **ET** dont le statut = SUBMITTED
- ❌ **NE PEUT PAS** modifier :
  - Les demandes d'autres utilisateurs
  - Ses demandes si statut ≠ SUBMITTED

**Pour un GESTIONNAIRE :**
- ✅ Peut modifier toutes les demandes
- ✅ Peut modifier quel que soit le statut

**Formulaire (même que création) :**
- Titre (pré-rempli avec valeur actuelle)
- Description (pré-remplie avec valeur actuelle)
- Type (pré-sélectionné avec valeur actuelle)

**Après modification réussie :**
1. Demande mise à jour
2. Date de modification mise à jour
3. Redirection vers `/requests/:id`
4. Message de succès : "Votre demande a été modifiée avec succès !"

---

## 👥 Différences Utilisateur vs Gestionnaire

### Rôle : UTILISATEUR

**Ce qu'il PEUT faire :**
- ✅ Voir **ses propres demandes** sur le tableau de bord
- ✅ Créer de nouvelles demandes
- ✅ Consulter **ses demandes** en détail
- ✅ Modifier **ses demandes** si statut = SUBMITTED
- ✅ Ajouter des commentaires sur **ses demandes**
- ✅ Se déconnecter

**Ce qu'il NE PEUT PAS faire :**
- ❌ Voir les demandes des autres utilisateurs
- ❌ Changer le statut d'une demande
- ❌ Modifier une demande si statut ≠ SUBMITTED
- ❌ Accéder aux demandes des autres (erreur 403)

---

### Rôle : GESTIONNAIRE

**Ce qu'il PEUT faire (en plus de ce que peut faire un utilisateur) :**
- ✅ Voir **toutes les demandes** de tous les utilisateurs
- ✅ Accéder à **n'importe quelle demande** en détail
- ✅ **Changer le statut** des demandes :
  - SUBMITTED → IN_PROGRESS
  - IN_PROGRESS → RESOLVED
  - RESOLVED → CLOSED
- ✅ Ajouter des commentaires sur **toutes les demandes**
- ✅ Modifier **toutes les demandes** (peu importe le statut)

**Responsabilités :**
- Traiter les demandes soumises
- Faire progresser les demandes dans le workflow
- Résoudre et fermer les demandes

---

## 🚫 Restrictions et Sécurité

### Vérification à chaque requête (L2)

**Le serveur vérifie TOUJOURS :**

1. **Token JWT valide ?**
   - Si non → Code 401 Unauthorized → Redirection `/login`

2. **Utilisateur authentifié ?**
   - Si non → Code 401 → Redirection `/login`

3. **Permissions pour cette action ?**
   - Si non → Code 403 Forbidden → Message d'erreur

### Scénarios de restriction

**Scénario 1 : Utilisateur essaie de voir une demande d'un autre**

1. Utilisateur A (ID=1) tape l'URL : `/requests/5`
2. La demande #5 appartient à l'utilisateur B (ID=2)
3. Backend vérifie : Demande.createur_id == Utilisateur.id ?
4. **NON** → Code 403 Forbidden
5. Frontend affiche : "Vous n'avez pas accès à cette demande"
6. Redirection automatique vers `/dashboard`

**Scénario 2 : Utilisateur essaie de modifier une demande en cours**

1. Utilisateur A clique sur "Modifier" pour sa demande
2. Statut de la demande = IN_PROGRESS
3. Frontend vérifie : Statut == SUBMITTED ?
4. **NON** → Bouton "Modifier" **masqué**
5. Si l'utilisateur force l'URL `/requests/5/edit` :
   - Backend refuse : Code 403
   - Message : "Cette demande ne peut plus être modifiée"

**Scénario 3 : Token expiré**

1. Utilisateur connecté il y a 24 heures (token expiré)
2. Il essaie d'accéder à `/dashboard`
3. Backend vérifie le token → Expiré
4. Code 401 Unauthorized
5. Frontend supprime le token
6. Redirection automatique vers `/login`
7. Message : "Votre session a expiré. Veuillez vous reconnecter."

---

## 🔴 Processus de Déconnexion

### Étape 1 : Clic sur "Déconnexion"

L'utilisateur clique sur le bouton "Déconnexion" dans la barre de navigation.

### Étape 2 : Nettoyage des données

**Côté frontend :**
1. Suppression du token JWT de `localStorage`
2. Réinitialisation du contexte `AuthContext` :
   - `user = null`
   - `isAuthenticated = false`
3. Suppression de toutes les données en mémoire

**Côté backend (L2) :**
- Aucune action requise (JWT est stateless)
- Le token devient invalide côté client

### Étape 3 : Redirection

Redirection automatique vers `/login` avec message :
> "Vous avez été déconnecté avec succès."

### Étape 4 : Tentative d'accès

Si l'utilisateur essaie d'accéder à une page protégée après déconnexion :
1. `ProtectedRoute` vérifie le token
2. Aucun token trouvé
3. Redirection automatique vers `/login`

---

## 📊 Diagramme de Flux Utilisateur Authentifié

```mermaid
graph TD
    A[Utilisateur connecté avec succès] --> B[Token JWT stocké]
    B --> C[Redirection /dashboard]
    
    C --> D{Quel rôle ?}
    
    D -->|Utilisateur| E[Voir SES demandes uniquement]
    D -->|Gestionnaire| F[Voir TOUTES les demandes]
    
    E --> G[Clic sur une demande]
    F --> G
    
    G --> H[Accès /requests/:id]
    
    H --> I{A-t-il les permissions ?}
    
    I -->|Oui| J[Affichage détail complet]
    I -->|Non| K[Erreur 403 Forbidden]
    K --> L[Redirection /dashboard]
    
    J --> M{Actions disponibles}
    
    M -->|Utilisateur propriétaire| N[Ajouter commentaire<br/>Modifier si SUBMITTED]
    M -->|Gestionnaire| O[Ajouter commentaire<br/>Changer statut<br/>Modifier toujours]
    
    C --> P[Clic Nouvelle demande]
    P --> Q[/requests/new]
    Q --> R[Remplit formulaire]
    R --> S[Soumet]
    S --> T[Demande créée SUBMITTED]
    T --> H
    
    C --> U[Clic Déconnexion]
    U --> V[Token supprimé]
    V --> W[Context réinitialisé]
    W --> X[Redirection /login]
```

---

## ✅ Résumé des Actions par Rôle

### Actions UTILISATEUR

| Action | Permission |
|--------|------------|
| Voir ses propres demandes | ✅ Oui |
| Voir les demandes des autres | ❌ Non |
| Créer une nouvelle demande | ✅ Oui |
| Modifier sa demande (SUBMITTED) | ✅ Oui |
| Modifier sa demande (autres statuts) | ❌ Non |
| Ajouter commentaire sur sa demande | ✅ Oui |
| Changer le statut | ❌ Non |
| Se déconnecter | ✅ Oui |

### Actions GESTIONNAIRE

| Action | Permission |
|--------|------------|
| Voir toutes les demandes | ✅ Oui |
| Créer une nouvelle demande | ✅ Oui |
| Modifier toutes les demandes | ✅ Oui |
| Ajouter commentaire partout | ✅ Oui |
| Changer le statut | ✅ Oui |
| Voir l'historique complet | ✅ Oui |
| Se déconnecter | ✅ Oui |

---

## 🔐 Identifiants de Test (L1 Uniquement)

Pour tester l'application au Livrable L1 avec les 2 rôles :

### Utilisateur standard :
```
Email : user@example.com
Mot de passe : Password123
Rôle : utilisateur
```

**Comportement attendu :**
- Voit uniquement ses propres demandes (mockées)
- Peut créer, modifier (si SUBMITTED), ajouter commentaires
- Ne peut PAS changer les statuts

### Gestionnaire :
```
Email : manager@example.com
Mot de passe : Manager123
Rôle : gestionnaire
```

**Comportement attendu :**
- Voit toutes les demandes de tous les utilisateurs
- Peut changer les statuts
- Peut modifier toutes les demandes

⚠️ **Note :** Ces identifiants sont simulés pour le L1. Au L2, ils seront remplacés par une vraie authentification.

---

## 📚 Références

- **POF Section 5.2 :** Gestion des demandes par les utilisateurs
- **POF Section 5.3 :** Gestion des demandes par les gestionnaires
- **POF Section 5.4 :** Transitions de statuts
- **Documentation A3 :** Définition des rôles (Membre 3)
- **Documentation A3.1 :** Matrice de permissions (Membre 3)
- **Documentation A4 :** Statuts et transitions (Membre 4)

---

## 📝 Historique des Modifications

| Date | Version | Auteur | Modifications |
|------|---------|--------|---------------|
| 2026-01-31 | 1.0 | Membre 2 | Création initiale du document |

---

**Dernière mise à jour :** 31 janvier 2026  
**Auteur :** Membre 2 - [Votre nom]  
**Projet :** UQO-Requests - INF1743 L1  
**Statut :** ✅ Complet
```

**Enregistrer le fichier (Ctrl+S ou Cmd+S)**