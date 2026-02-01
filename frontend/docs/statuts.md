# Statuts et Transitions des Demandes

## 📋 Introduction

Une demande dans l'application UQO-Requests passe par différents **statuts** au cours de son cycle de vie, depuis sa création jusqu'à sa fermeture.

Ce document décrit :
- Les 4 statuts disponibles
- Les transitions autorisées entre statuts
- Qui peut changer les statuts
- Le cycle de vie complet d'une demande

---

## 📊 Les 4 Statuts

### 1. SUBMITTED (Soumis)

**Code :** `SUBMITTED`  
**Label :** Soumis  
**Couleur :** 🟡 Jaune (#FFC107)  
**Icône :** 📝

**Description :**
Statut **initial** d'une demande lors de sa création. La demande a été soumise par l'utilisateur et est en attente de traitement par un gestionnaire.

**Caractéristiques :**
- Statut automatique lors de la création
- Aucune action manuelle requise
- La demande attend dans la file d'attente

**Actions possibles :**
- ✅ **Utilisateur (créateur)** peut **modifier** la demande (titre, description, type)
- ✅ **Utilisateur (créateur)** peut **ajouter des commentaires**
- ✅ **Gestionnaire** peut **prendre en charge** (→ IN_PROGRESS)
- ✅ **Gestionnaire** peut **ajouter des commentaires**

**Signification pour l'utilisateur :**
> "Votre demande a été soumise avec succès. Un gestionnaire la prendra en charge prochainement."

---

### 2. IN_PROGRESS (En cours)

**Code :** `IN_PROGRESS`  
**Label :** En cours  
**Couleur :** 🔵 Bleu (#17A2B8)  
**Icône :** ⚙️

**Description :**
La demande est actuellement **en cours de traitement** par un gestionnaire. Des actions sont entreprises pour résoudre le problème ou répondre à la demande.

**Caractéristiques :**
- Indique un traitement actif
- Gestionnaire responsable assigné implicitement
- Communication active attendue

**Actions possibles :**
- ❌ **Utilisateur (créateur)** NE PEUT PLUS **modifier** la demande
- ✅ **Utilisateur (créateur)** peut **ajouter des commentaires** (précisions, questions)
- ✅ **Gestionnaire** peut **marquer comme résolu** (→ RESOLVED)
- ✅ **Gestionnaire** peut **ajouter des commentaires** (mises à jour, questions)

**Signification pour l'utilisateur :**
> "Votre demande est en cours de traitement. Un gestionnaire travaille actuellement dessus."

**Signification pour le gestionnaire :**
> "Je suis en train de traiter cette demande. Je dois communiquer régulièrement avec l'utilisateur."

---

### 3. RESOLVED (Résolu)

**Code :** `RESOLVED`  
**Label :** Résolu  
**Couleur :** 🟢 Vert (#28A745)  
**Icône :** ✅

**Description :**
La demande a été **traitée et résolue** par le gestionnaire. Une solution a été apportée, mais la demande n'est pas encore fermée définitivement (période de vérification).

**Caractéristiques :**
- Solution apportée par le gestionnaire
- Période de validation par l'utilisateur
- Peut être réouverte si problème persiste

**Actions possibles :**
- ❌ **Utilisateur (créateur)** NE PEUT PAS **modifier** la demande
- ✅ **Utilisateur (créateur)** peut **ajouter des commentaires** (validation, problème persiste)
- ✅ **Gestionnaire** peut **fermer définitivement** (→ CLOSED)
- ✅ **Gestionnaire** peut **réouvrir** si nécessaire (→ IN_PROGRESS)
- ✅ **Gestionnaire** peut **ajouter des commentaires** (explications résolution)

**Signification pour l'utilisateur :**
> "Votre demande a été résolue. Si le problème persiste, merci de nous le signaler."

**Signification pour le gestionnaire :**
> "J'ai résolu cette demande. J'attends confirmation de l'utilisateur avant de la fermer définitivement."

---

### 4. CLOSED (Fermé)

**Code :** `CLOSED`  
**Label :** Fermé  
**Couleur :** ⚫ Gris (#6C757D)  
**Icône :** 🔒

**Description :**
La demande est **fermée définitivement**. La solution a été validée et la demande est archivée. Aucune action supplémentaire ne peut être effectuée.

**Caractéristiques :**
- Statut final (terminal)
- Aucune modification possible
- Demande archivée
- Consultable en lecture seule

**Actions possibles :**
- ❌ **Utilisateur (créateur)** NE PEUT PAS **modifier** la demande
- ❌ **Utilisateur (créateur)** NE PEUT PAS **ajouter de commentaires** (demande archivée)
- ❌ **Gestionnaire** NE PEUT PAS **changer le statut** (état final)
- ❌ **Gestionnaire** NE PEUT PAS **ajouter de commentaires**

**Signification pour l'utilisateur :**
> "Votre demande est fermée. Si vous avez un nouveau problème, veuillez créer une nouvelle demande."

**Signification pour le gestionnaire :**
> "Cette demande est archivée. Aucune action supplémentaire possible."

---

## 🔄 Cycle de Vie d'une Demande

### Diagramme complet

```
┌─────────────┐
│   SUBMITTED │ ◄── Création automatique
└──────┬──────┘
       │
       │ Gestionnaire prend en charge
       ↓
┌─────────────┐
│ IN_PROGRESS │
└──────┬──────┘
       │
       │ Gestionnaire marque comme résolu
       ↓
┌─────────────┐
│  RESOLVED   │
└──────┬──────┘
       │
       ├──────────────────────┐
       │                      │
       │ Fermeture définitive │ Réouverture si problème
       ↓                      ↓
┌─────────────┐        ┌─────────────┐
│   CLOSED    │        │ IN_PROGRESS │
└─────────────┘        └─────────────┘
```

### Transitions autorisées

| Statut actuel | Statut suivant | Autorisé ? | Acteur | Condition |
|---------------|----------------|------------|--------|-----------|
| **SUBMITTED** | IN_PROGRESS | ✅ Oui | Gestionnaire | Prise en charge |
| **SUBMITTED** | RESOLVED | ❌ Non | - | Transition invalide |
| **SUBMITTED** | CLOSED | ❌ Non | - | Transition invalide |
| **IN_PROGRESS** | RESOLVED | ✅ Oui | Gestionnaire | Résolution terminée |
| **IN_PROGRESS** | CLOSED | ❌ Non | - | Doit passer par RESOLVED |
| **IN_PROGRESS** | SUBMITTED | ❌ Non | - | Régression invalide |
| **RESOLVED** | CLOSED | ✅ Oui | Gestionnaire | Validation finale |
| **RESOLVED** | IN_PROGRESS | ✅ Oui | Gestionnaire | Problème persiste |
| **RESOLVED** | SUBMITTED | ❌ Non | - | Régression invalide |
| **CLOSED** | * (tous) | ❌ Non | - | Statut terminal |

### Transitions valides uniquement

```
SUBMITTED ──────────────────> IN_PROGRESS
                                    │
                                    │
                                    ↓
                                RESOLVED
                                ↙      ↘
                          CLOSED    IN_PROGRESS (réouverture)
```

---

## 👤 Permissions de Changement de Statut

### Utilisateur (rôle : `utilisateur`)

**Permissions :**
- ❌ **AUCUN** contrôle sur les statuts
- ❌ Ne peut PAS changer le statut de ses demandes
- ✅ Peut **consulter** le statut actuel de ses demandes
- ✅ Peut **voir l'historique** des changements de statut

**Raison :**
Les statuts reflètent l'état du traitement par le gestionnaire. Seul le gestionnaire, qui effectue le travail, peut mettre à jour le statut.

---

### Gestionnaire (rôle : `gestionnaire`)

**Permissions :**
- ✅ **CONTRÔLE TOTAL** sur les statuts
- ✅ Peut changer le statut de **toutes** les demandes
- ✅ Doit respecter les **transitions autorisées**
- ✅ Chaque changement est **enregistré dans l'historique**

**Responsabilités :**
1. Prendre en charge les demandes SUBMITTED
2. Faire progresser les demandes IN_PROGRESS
3. Résoudre et marquer RESOLVED
4. Fermer définitivement en CLOSED après validation

---

## 📝 Historique des Changements

### Enregistrement automatique

Chaque changement de statut est **automatiquement enregistré** dans l'historique de la demande.

**Informations enregistrées :**
- Ancien statut
- Nouveau statut
- Utilisateur ayant effectué le changement (gestionnaire)
- Date et heure exacte du changement

**Exemple d'entrée d'historique :**
```
📅 31 janvier 2026 à 14:30
Marie Gestionnaire a changé le statut de SUBMITTED à IN_PROGRESS
```

**Visibilité :**
- ✅ Utilisateur (créateur) : Peut voir l'historique de **ses demandes**
- ✅ Gestionnaire : Peut voir l'historique de **toutes les demandes**

---

## 🎯 Scénarios Types

### Scénario 1 : Traitement normal (succès)

**Durée :** 3-5 jours

1. **Jour 1, 10:00** - Utilisateur crée une demande
   - Statut : **SUBMITTED** (automatique)
   - Description : "Je n'arrive pas à me connecter au VPN"

2. **Jour 1, 14:00** - Gestionnaire prend en charge
   - Transition : SUBMITTED → **IN_PROGRESS**
   - Commentaire : "Je regarde votre problème de VPN"

3. **Jour 2, 11:00** - Gestionnaire identifie le problème
   - Statut : Toujours IN_PROGRESS
   - Commentaire : "Le certificat VPN a expiré. Je le renouvelle."

4. **Jour 2, 15:00** - Gestionnaire résout
   - Transition : IN_PROGRESS → **RESOLVED**
   - Commentaire : "Certificat renouvelé. Pouvez-vous réessayer ?"

5. **Jour 3, 09:00** - Utilisateur confirme
   - Statut : Toujours RESOLVED
   - Commentaire : "Ça fonctionne maintenant, merci !"

6. **Jour 3, 10:00** - Gestionnaire ferme
   - Transition : RESOLVED → **CLOSED**
   - Demande archivée

---

### Scénario 2 : Réouverture (problème persiste)

**Durée :** 5-7 jours

1. **Jour 1** - Demande créée
   - Statut : **SUBMITTED**

2. **Jour 1** - Prise en charge
   - Transition : SUBMITTED → **IN_PROGRESS**

3. **Jour 2** - Première résolution
   - Transition : IN_PROGRESS → **RESOLVED**
   - Commentaire : "J'ai corrigé le bug"

4. **Jour 3** - Utilisateur teste
   - Statut : Toujours RESOLVED
   - Commentaire : "Le problème persiste dans d'autres cas"

5. **Jour 3** - Gestionnaire réouvre
   - Transition : RESOLVED → **IN_PROGRESS**
   - Commentaire : "Je reprends le traitement pour corriger les autres cas"

6. **Jour 5** - Deuxième résolution
   - Transition : IN_PROGRESS → **RESOLVED**
   - Commentaire : "Tous les cas sont maintenant corrigés"

7. **Jour 6** - Validation finale
   - Statut : Toujours RESOLVED
   - Commentaire : "Tout fonctionne parfaitement !"

8. **Jour 6** - Fermeture définitive
   - Transition : RESOLVED → **CLOSED**

---

### Scénario 3 : Modification par utilisateur (SUBMITTED uniquement)

**Utilisateur peut modifier SEULEMENT si SUBMITTED :**

1. **10:00** - Demande créée
   - Statut : **SUBMITTED**
   - Titre : "Probleme de login"

2. **10:05** - Utilisateur modifie (avant prise en charge)
   - Statut : Toujours **SUBMITTED** ✅ Modification autorisée
   - Titre corrigé : "Problème de connexion VPN"
   - Description complétée

3. **11:00** - Gestionnaire prend en charge
   - Transition : SUBMITTED → **IN_PROGRESS**

4. **11:30** - Utilisateur essaie de modifier
   - Statut : **IN_PROGRESS** ❌ Modification refusée
   - Bouton "Modifier" n'apparaît plus
   - Raison : Demande en cours de traitement

**Message à l'utilisateur :**
> "Cette demande est en cours de traitement et ne peut plus être modifiée. Vous pouvez ajouter des précisions via les commentaires."

---

## 🔐 Règles de Validation

### Règle 1 : Transitions obligatoires

**Une demande DOIT passer par tous les statuts intermédiaires :**
- ❌ SUBMITTED → CLOSED (INVALIDE - pas de résolution)
- ✅ SUBMITTED → IN_PROGRESS → RESOLVED → CLOSED (VALIDE)

**Raison :** Assurer la traçabilité du traitement complet.

---

### Règle 2 : CLOSED est terminal

**Une fois CLOSED, aucun retour possible :**
- ❌ CLOSED → IN_PROGRESS (INVALIDE)
- ❌ CLOSED → RESOLVED (INVALIDE)
- ❌ CLOSED → SUBMITTED (INVALIDE)

**Raison :** Une demande fermée est archivée. Pour rouvrir, créer une **nouvelle demande**.

---

### Règle 3 : RESOLVED permet la réouverture

**Seul RESOLVED peut retourner à IN_PROGRESS :**
- ✅ RESOLVED → IN_PROGRESS (VALIDE - si problème persiste)
- ✅ RESOLVED → CLOSED (VALIDE - validation finale)

**Raison :** Période de validation permettant de vérifier la résolution.

---

### Règle 4 : Gestionnaire uniquement

**Seul un gestionnaire peut changer les statuts :**
- ✅ Rôle = `gestionnaire` → Changement autorisé
- ❌ Rôle = `utilisateur` → Changement refusé (403 Forbidden)

**Implémentation (L2) :**
```python
# Backend vérifie avant chaque changement
if request.user.role != 'gestionnaire':
    return Response(
        {'error': 'Seuls les gestionnaires peuvent changer les statuts'},
        status=403
    )
```

---

## 📊 Durées Moyennes par Statut

### Statistiques typiques

| Statut | Durée moyenne | Durée acceptable |
|--------|---------------|------------------|
| **SUBMITTED** | 4 heures | < 24 heures |
| **IN_PROGRESS** | 2-3 jours | < 7 jours |
| **RESOLVED** | 1 jour | < 3 jours |
| **CLOSED** | Indéfini | Archivage permanent |

### Indicateurs de performance (KPI)

**Temps de première réponse :**
- Temps entre SUBMITTED et IN_PROGRESS
- Objectif : < 24 heures

**Temps de résolution :**
- Temps entre SUBMITTED et RESOLVED
- Objectif : < 7 jours pour demandes normales

**Taux de réouverture :**
- % de demandes RESOLVED retournant à IN_PROGRESS
- Objectif : < 10%

---

## 🎨 Représentation Visuelle

### Couleurs et badges

**Dans l'interface utilisateur, chaque statut a une couleur spécifique :**

```css
/* SUBMITTED - Jaune */
background: rgba(255, 193, 7, 0.2);
color: #f57c00;

/* IN_PROGRESS - Bleu */
background: rgba(23, 162, 184, 0.2);
color: #0c5460;

/* RESOLVED - Vert */
background: rgba(40, 167, 69, 0.2);
color: #155724;

/* CLOSED - Gris */
background: rgba(108, 117, 125, 0.2);
color: #383d41;
```

### Icônes recommandées

- **SUBMITTED** : 📝 (document)
- **IN_PROGRESS** : ⚙️ (engrenage) ou 🔄 (flèche circulaire)
- **RESOLVED** : ✅ (coche)
- **CLOSED** : 🔒 (cadenas) ou ⛔ (interdiction)

---

## 📚 Références

- **POF Section 4.3 :** Gestion des statuts
- **POF Section 5.4 :** Transitions autorisées
- **Documentation A3 :** Définition des rôles
- **Documentation A3.1 :** Matrice de permissions