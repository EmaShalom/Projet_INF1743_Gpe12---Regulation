# Définition des Rôles

## 📋 Introduction

L'application UQO-Requests utilise un **système de rôles** pour contrôler l'accès aux fonctionnalités. Il existe **2 rôles** avec des permissions différentes :

1. **Utilisateur** (`utilisateur`)
2. **Gestionnaire** (`gestionnaire`)

Ce document définit chaque rôle, ses responsabilités et ses permissions.

---

## 👤 Rôle : Utilisateur

### Définition

Un **utilisateur** est une personne qui utilise l'application pour soumettre et suivre ses propres demandes de support, de fonctionnalités ou de corrections.

### Caractéristiques

**Type :** Rôle standard (par défaut)  
**Code dans l'application :** `utilisateur`  
**Assignation :** Automatique lors de l'inscription  
**Nombre d'utilisateurs :** Illimité

### Responsabilités

1. **Créer des demandes** pour signaler des problèmes, demander des fonctionnalités ou poser des questions
2. **Suivre l'état** de ses demandes
3. **Collaborer** en ajoutant des commentaires et des précisions
4. **Modifier ses demandes** tant qu'elles ne sont pas en traitement

### Permissions principales

**Demandes :**
- ✅ Créer de nouvelles demandes
- ✅ Consulter **ses propres demandes** uniquement
- ✅ Modifier **ses demandes** si statut = SUBMITTED
- ❌ Voir les demandes des autres utilisateurs
- ❌ Modifier les demandes des autres
- ❌ Supprimer des demandes

**Statuts :**
- ❌ Ne peut PAS changer les statuts
- ✅ Peut voir le statut actuel de ses demandes
- ✅ Peut voir l'historique des changements de statut

**Commentaires :**
- ✅ Ajouter des commentaires sur **ses propres demandes**
- ✅ Voir tous les commentaires sur ses demandes
- ❌ Ajouter des commentaires sur les demandes des autres

**Accès :**
- ✅ Tableau de bord personnel (ses demandes uniquement)
- ✅ Page de détail (pour ses demandes)
- ✅ Formulaire de création de demande
- ✅ Formulaire de modification (si SUBMITTED)

### Workflow typique

1. **Connexion** à l'application
2. **Accès au tableau de bord** (voit ses demandes)
3. **Création d'une demande** (titre, description, type)
4. **Soumission** (statut = SUBMITTED)
5. **Attente** que le gestionnaire traite la demande
6. **Ajout de commentaires** si besoin de précisions
7. **Consultation de l'historique** pour suivre les changements
8. **Vérification de la résolution** (statut = RESOLVED ou CLOSED)

### Restrictions importantes

**Isolation des données :**
- Un utilisateur voit **UNIQUEMENT** ses propres demandes
- Tentative d'accès aux demandes d'autres → Erreur 403 Forbidden

**Modification limitée :**
- Peut modifier **SEULEMENT** si statut = SUBMITTED
- Si statut = IN_PROGRESS, RESOLVED ou CLOSED → Modification **interdite**
- Raison : La demande est en cours de traitement ou terminée

**Pas de gestion de statuts :**
- Ne peut PAS changer SUBMITTED → IN_PROGRESS
- Ne peut PAS changer IN_PROGRESS → RESOLVED
- Seul un **gestionnaire** peut changer les statuts

---

## 👨‍💼 Rôle : Gestionnaire

### Définition

Un **gestionnaire** est une personne responsable de la **gestion et du traitement** de toutes les demandes soumises dans l'application. Il supervise le workflow complet.

### Caractéristiques

**Type :** Rôle administratif  
**Code dans l'application :** `gestionnaire`  
**Assignation :** Manuelle par un administrateur système  
**Nombre de gestionnaires :** Limité (quelques personnes)

### Responsabilités

1. **Traiter** toutes les demandes soumises par les utilisateurs
2. **Prioriser** les demandes selon leur urgence et importance
3. **Faire progresser** les demandes dans le workflow (changement de statut)
4. **Communiquer** avec les utilisateurs via les commentaires
5. **Résoudre** les demandes et les fermer une fois terminées
6. **Superviser** l'ensemble du système de demandes

### Permissions principales

**Demandes :**
- ✅ Consulter **TOUTES les demandes** (tous utilisateurs)
- ✅ Créer de nouvelles demandes (comme un utilisateur)
- ✅ Modifier **toutes les demandes** (peu importe le statut)
- ✅ Voir les détails complets de toutes les demandes
- ❌ Supprimer des demandes (non implémenté au L1)

**Statuts :**
- ✅ **Changer le statut** de n'importe quelle demande
- ✅ Transitions autorisées :
  - SUBMITTED → IN_PROGRESS (prendre en charge)
  - IN_PROGRESS → RESOLVED (marquer comme résolu)
  - RESOLVED → CLOSED (fermer définitivement)
  - RESOLVED → IN_PROGRESS (réouvrir si nécessaire)
- ✅ Voir l'historique complet des changements

**Commentaires :**
- ✅ Ajouter des commentaires sur **toutes les demandes**
- ✅ Communiquer avec tous les utilisateurs
- ✅ Demander des précisions ou donner des mises à jour

**Accès :**
- ✅ Tableau de bord global (toutes les demandes)
- ✅ Page de détail (pour toutes les demandes)
- ✅ Formulaire de création de demande
- ✅ Formulaire de modification (toujours accessible)
- ✅ Contrôle de changement de statut

### Workflow typique

1. **Connexion** à l'application
2. **Accès au tableau de bord** (voit **toutes** les demandes)
3. **Tri/Filtrage** des demandes par statut (SUBMITTED en priorité)
4. **Sélection d'une demande** à traiter
5. **Analyse** de la demande (titre, description, type)
6. **Changement de statut** SUBMITTED → IN_PROGRESS
7. **Ajout d'un commentaire** pour informer l'utilisateur
8. **Travail** sur la résolution de la demande
9. **Changement de statut** IN_PROGRESS → RESOLVED
10. **Ajout d'un commentaire** pour expliquer la résolution
11. **Fermeture** RESOLVED → CLOSED (après confirmation)

### Responsabilités spécifiques

**Priorisation :**
- Identifier les demandes urgentes ou critiques
- Traiter en priorité les bugs bloquants
- Gérer les demandes selon leur impact

**Communication :**
- Informer les utilisateurs de l'avancement
- Demander des précisions si nécessaire
- Expliquer les résolutions

**Gestion du workflow :**
- Maintenir les demandes en mouvement
- Ne pas laisser stagner les demandes
- Fermer les demandes résolues

---

## 📊 Comparaison des Rôles

### Tableau récapitulatif

| Fonctionnalité | Utilisateur | Gestionnaire |
|----------------|-------------|--------------|
| **Voir ses propres demandes** | ✅ Oui | ✅ Oui |
| **Voir toutes les demandes** | ❌ Non | ✅ Oui |
| **Créer une demande** | ✅ Oui | ✅ Oui |
| **Modifier ses demandes (SUBMITTED)** | ✅ Oui | ✅ Oui |
| **Modifier ses demandes (autres statuts)** | ❌ Non | ✅ Oui |
| **Modifier demandes des autres** | ❌ Non | ✅ Oui |
| **Changer les statuts** | ❌ Non | ✅ Oui |
| **Ajouter commentaire sur ses demandes** | ✅ Oui | ✅ Oui |
| **Ajouter commentaire sur toutes** | ❌ Non | ✅ Oui |
| **Voir l'historique** | ✅ Oui (ses demandes) | ✅ Oui (toutes) |
| **Supprimer une demande** | ❌ Non | ❌ Non (L1) |

### Différences clés

**Portée d'accès :**
- Utilisateur : **Ses demandes uniquement**
- Gestionnaire : **Toutes les demandes**

**Gestion des statuts :**
- Utilisateur : **Lecture seule**
- Gestionnaire : **Contrôle complet**

**Modification :**
- Utilisateur : **Limitée** (SUBMITTED uniquement)
- Gestionnaire : **Illimitée** (tous statuts)

---

## 🔒 Assignation des Rôles

### Attribution du rôle Utilisateur

**Automatique lors de l'inscription :**

1. Utilisateur crée un compte via `/register`
2. Formulaire d'inscription soumis
3. Compte créé en base de données
4. Rôle = `utilisateur` **par défaut**
5. Aucune action manuelle requise

**Code (L2) :**
```python
# Lors de la création d'un compte
user = User.objects.create(
    nom_complet=form.cleaned_data['nom_complet'],
    email=form.cleaned_data['email'],
    password=hashed_password,
    role='utilisateur'  # Par défaut
)
```

### Attribution du rôle Gestionnaire

**Manuelle par un administrateur système :**

**Au L1 (données mockées) :**
- Compte gestionnaire déjà créé dans `mockData.js`
- Email : `manager@example.com`
- Rôle : `gestionnaire`

**Au L2 (base de données) :**
- Création manuelle en base de données
- OU via une interface d'administration Django
- OU via une commande de gestion

**Critères de sélection :**
- Personne de confiance
- Connaissance technique
- Capacité à gérer les demandes
- Responsabilité et fiabilité

**Processus recommandé :**
1. Utilisateur s'inscrit normalement (rôle = utilisateur)
2. Administrateur système identifie le besoin d'un gestionnaire
3. Administrateur change manuellement le rôle en base de données
4. Utilisateur déconnecté et reconnecté → Maintenant gestionnaire

---

## 🔐 Sécurité et Validation

### Vérification à chaque requête (L2)

**Le backend vérifie TOUJOURS :**

1. **Token JWT valide ?** → Si non : 401 Unauthorized
2. **Rôle de l'utilisateur ?** → Extrait du token JWT
3. **Permission pour cette action ?** → Si non : 403 Forbidden

### Exemples de vérification

**Scénario 1 : Utilisateur essaie de voir toutes les demandes**

```python
# Backend vérifie :
if request.user.role != 'gestionnaire':
    return Response(
        {'error': 'Accès refusé'},
        status=403
    )
```

**Scénario 2 : Utilisateur essaie de changer un statut**

```python
# Backend vérifie :
if request.user.role != 'gestionnaire':
    return Response(
        {'error': 'Seuls les gestionnaires peuvent changer les statuts'},
        status=403
    )
```

---

## 🔄 Évolution des Rôles (Futur)

### Rôles additionnels possibles (L3+)

**Administrateur système :**
- Gestion des utilisateurs (créer, modifier, supprimer)
- Attribution des rôles
- Configuration système
- Accès aux logs

**Superviseur :**
- Peut voir toutes les demandes (lecture seule)
- Peut générer des rapports
- Ne peut pas modifier ou changer les statuts

**Support technique :**
- Peut voir et commenter toutes les demandes
- Ne peut pas changer les statuts
- Rôle intermédiaire entre utilisateur et gestionnaire

### Hiérarchie possible

```
Administrateur système
        ↓
   Gestionnaire
        ↓
    Superviseur
        ↓
  Support technique
        ↓
    Utilisateur
```

---

## 📚 Références

- **POF Section 3.2 :** Gestion des utilisateurs et rôles
- **POF Section 5.3 :** Permissions par rôle
- **Documentation A3.1 :** Matrice de permissions détaillée

---


