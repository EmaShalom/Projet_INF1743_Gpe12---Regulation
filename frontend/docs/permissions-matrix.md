# Matrice de Permissions

## 📋 Introduction

Ce document présente la **matrice complète des permissions** pour chaque rôle de l'application UQO-Requests.

La matrice définit **qui peut faire quoi** dans l'application.

---

## 📊 Matrice Complète

### Actions sur les Demandes

| Action | Utilisateur | Gestionnaire | Explication |
|--------|-------------|--------------|-------------|
| **Créer une nouvelle demande** | ✅ Oui | ✅ Oui | Tous peuvent créer des demandes |
| **Voir ses propres demandes** | ✅ Oui | ✅ Oui | Accès à ses demandes personnelles |
| **Voir toutes les demandes** | ❌ Non | ✅ Oui | Seul gestionnaire voit tout |
| **Voir une demande spécifique (propriétaire)** | ✅ Oui | ✅ Oui | Si c'est sa demande |
| **Voir une demande spécifique (non propriétaire)** | ❌ Non | ✅ Oui | Utilisateur → 403 Forbidden |
| **Modifier sa demande (SUBMITTED)** | ✅ Oui | ✅ Oui | Avant traitement |
| **Modifier sa demande (IN_PROGRESS)** | ❌ Non | ✅ Oui | En cours de traitement |
| **Modifier sa demande (RESOLVED)** | ❌ Non | ✅ Oui | Déjà résolue |
| **Modifier sa demande (CLOSED)** | ❌ Non | ✅ Oui | Fermée |
| **Modifier demande d'un autre** | ❌ Non | ✅ Oui | Gestionnaire peut tout modifier |
| **Supprimer une demande** | ❌ Non | ❌ Non | Non implémenté au L1 |

### Actions sur les Statuts

| Action | Utilisateur | Gestionnaire | Explication |
|--------|-------------|--------------|-------------|
| **Voir le statut actuel** | ✅ Oui | ✅ Oui | Visible pour tous |
| **Changer SUBMITTED → IN_PROGRESS** | ❌ Non | ✅ Oui | Prise en charge |
| **Changer IN_PROGRESS → RESOLVED** | ❌ Non | ✅ Oui | Résolution |
| **Changer RESOLVED → CLOSED** | ❌ Non | ✅ Oui | Fermeture |
| **Changer RESOLVED → IN_PROGRESS** | ❌ Non | ✅ Oui | Réouverture |
| **Changer SUBMITTED → RESOLVED** | ❌ Non | ❌ Non | Transition invalide |
| **Changer SUBMITTED → CLOSED** | ❌ Non | ❌ Non | Transition invalide |

### Actions sur les Commentaires

| Action | Utilisateur | Gestionnaire | Explication |
|--------|-------------|--------------|-------------|
| **Ajouter commentaire sur sa demande** | ✅ Oui | ✅ Oui | Communication |
| **Ajouter commentaire sur demande d'un autre** | ❌ Non | ✅ Oui | Gestionnaire → toutes |
| **Voir commentaires sur sa demande** | ✅ Oui | ✅ Oui | Tous les commentaires |
| **Voir commentaires sur demande d'un autre** | ❌ Non | ✅ Oui | Utilisateur → 403 |
| **Modifier un commentaire** | ❌ Non | ❌ Non | Non implémenté L1 |
| **Supprimer un commentaire** | ❌ Non | ❌ Non | Non implémenté L1 |

### Actions sur l'Historique

| Action | Utilisateur | Gestionnaire | Explication |
|--------|-------------|--------------|-------------|
| **Voir historique de sa demande** | ✅ Oui | ✅ Oui | Traçabilité |
| **Voir historique d'une autre demande** | ❌ Non | ✅ Oui | Gestionnaire → tout |
| **Ajouter entrée à l'historique** | ❌ Automatique | ❌ Automatique | Lors changement statut |

### Actions d'Authentification

| Action | Utilisateur | Gestionnaire | Explication |
|--------|-------------|--------------|-------------|
| **S'inscrire** | ✅ Oui | N/A | Rôle = utilisateur |
| **Se connecter** | ✅ Oui | ✅ Oui | Avec identifiants |
| **Se déconnecter** | ✅ Oui | ✅ Oui | Suppression token |
| **Changer son mot de passe** | ❌ L1 | ❌ L1 | À implémenter L2 |
| **Modifier son profil** | ❌ L1 | ❌ L1 | À implémenter L2 |

### Accès aux Pages

| Page | URL | Utilisateur | Gestionnaire |
|------|-----|-------------|--------------|
| **Connexion** | `/login` | ✅ Oui | ✅ Oui |
| **Inscription** | `/register` | ✅ Oui | ✅ Oui |
| **Tableau de bord** | `/dashboard` | ✅ Oui (ses demandes) | ✅ Oui (toutes) |
| **Détail demande (propriétaire)** | `/requests/:id` | ✅ Oui | ✅ Oui |
| **Détail demande (non propriétaire)** | `/requests/:id` | ❌ Non (403) | ✅ Oui |
| **Nouvelle demande** | `/requests/new` | ✅ Oui | ✅ Oui |
| **Modifier demande (SUBMITTED, propriétaire)** | `/requests/:id/edit` | ✅ Oui | ✅ Oui |
| **Modifier demande (autres statuts, propriétaire)** | `/requests/:id/edit` | ❌ Non | ✅ Oui |
| **Modifier demande (non propriétaire)** | `/requests/:id/edit` | ❌ Non (403) | ✅ Oui |

---

## 🔐 Règles de Sécurité

### Règle 1 : Isolation des Données

**Utilisateur :**
- Ne peut accéder QU'à ses propres demandes
- Tentative d'accès à une demande d'un autre → **403 Forbidden**
- Redirection automatique vers `/dashboard`

**Gestionnaire :**
- Peut accéder à toutes les demandes sans restriction

### Règle 2 : Modification Conditionnelle

**Utilisateur :**
- Peut modifier **SEULEMENT** si :
  - Il est le propriétaire de la demande **ET**
  - Le statut de la demande = SUBMITTED
- Sinon → Bouton "Modifier" masqué

**Gestionnaire :**
- Peut modifier toutes les demandes, quel que soit le statut
- Aucune restriction

### Règle 3 : Gestion des Statuts

**Utilisateur :**
- **AUCUN** contrôle sur les statuts
- Peut uniquement **consulter** le statut actuel

**Gestionnaire :**
- **TOTAL** contrôle sur les statuts
- Peut effectuer les transitions autorisées
- Enregistrement automatique dans l'historique

### Règle 4 : Commentaires Limités

**Utilisateur :**
- Peut commenter **SEULEMENT** sur ses propres demandes
- Ne peut pas commenter sur les demandes des autres

**Gestionnaire :**
- Peut commenter sur **toutes** les demandes
- Utilisé pour communiquer avec tous les utilisateurs

---

## 📋 Transitions de Statuts Autorisées

### Pour Gestionnaire UNIQUEMENT

```
SUBMITTED ──────────────> IN_PROGRESS
                              │
                              ↓
                          RESOLVED
                          ↙      ↘
                    CLOSED    IN_PROGRESS (réouverture)
```

### Transitions Valides

| De | Vers | Autorisé | Acteur |
|----|------|----------|--------|
| SUBMITTED | IN_PROGRESS | ✅ Oui | Gestionnaire |
| SUBMITTED | RESOLVED | ❌ Non | - |
| SUBMITTED | CLOSED | ❌ Non | - |
| IN_PROGRESS | RESOLVED | ✅ Oui | Gestionnaire |
| IN_PROGRESS | CLOSED | ❌ Non | - |
| IN_PROGRESS | SUBMITTED | ❌ Non | - |
| RESOLVED | CLOSED | ✅ Oui | Gestionnaire |
| RESOLVED | IN_PROGRESS | ✅ Oui | Gestionnaire |
| RESOLVED | SUBMITTED | ❌ Non | - |
| CLOSED | * (tout) | ❌ Non | - |

---

## 🔍 Exemples de Scénarios

### Scénario 1 : Utilisateur A essaie de voir la demande de l'utilisateur B

**Contexte :**
- Utilisateur A (ID=1, rôle=utilisateur)
- Demande #5 créée par Utilisateur B (ID=2)

**Action :** Utilisateur A tape `/requests/5` dans le navigateur

**Vérification backend :**
```python
# Demande #5
request = Request.objects.get(id=5)

# Vérifier propriétaire
if request.createur_id != user.id and user.role != 'gestionnaire':
    return Response({'error': 'Accès refusé'}, status=403)
```

**Résultat :**
- Code : **403 Forbidden**
- Message : "Vous n'avez pas accès à cette demande"
- Redirection : `/dashboard`

---

### Scénario 2 : Utilisateur essaie de modifier sa demande en cours

**Contexte :**
- Utilisateur A (ID=1, rôle=utilisateur)
- Demande #3 créée par Utilisateur A (propriétaire ✅)
- Statut de la demande #3 = IN_PROGRESS

**Action :** Utilisateur A clique sur "Modifier"

**Vérification frontend :**
```jsx
// Bouton "Modifier" affiché si :
const canEdit = (
  request.createur_id === user.id &&
  request.statut === 'SUBMITTED'
)

// Statut = IN_PROGRESS → canEdit = false
// Bouton "Modifier" MASQUÉ
```

**Vérification backend (si force l'URL) :**
```python
if user.role != 'gestionnaire':
    if request.statut != 'SUBMITTED':
        return Response(
            {'error': 'Cette demande ne peut plus être modifiée'},
            status=403
        )
```

**Résultat :**
- Bouton "Modifier" n'apparaît pas
- Si force l'URL → **403 Forbidden**
- Message : "Cette demande ne peut plus être modifiée"

---

### Scénario 3 : Gestionnaire change le statut d'une demande

**Contexte :**
- Gestionnaire (ID=2, rôle=gestionnaire)
- Demande #8 créée par Utilisateur C (ID=5)
- Statut actuel = SUBMITTED

**Action :** Gestionnaire change le statut à IN_PROGRESS

**Vérification backend :**
```python
# Vérifier rôle
if user.role != 'gestionnaire':
    return Response(
        {'error': 'Seuls les gestionnaires peuvent changer les statuts'},
        status=403
    )

# Vérifier transition valide
if ancien_statut == 'SUBMITTED' and nouveau_statut == 'IN_PROGRESS':
    # Transition valide ✅
    request.statut = nouveau_statut
    request.save()
    
    # Créer entrée historique
    StatusHistory.objects.create(
        request=request,
        ancien_statut='SUBMITTED',
        nouveau_statut='IN_PROGRESS',
        modifie_par=user
    )
```

**Résultat :**
- Statut changé : SUBMITTED → IN_PROGRESS
- Historique créé
- Badge mis à jour sur l'interface

---

## 📚 Références

- **POF Section 3.2 :** Gestion des rôles
- **POF Section 5.3 :** Matrice de permissions
- **Documentation A3 :** Définition des rôles
- **Documentation A4 :** Statuts et transitions