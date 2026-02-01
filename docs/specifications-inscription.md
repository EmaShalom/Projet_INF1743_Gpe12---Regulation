# Spécifications - Processus d'Inscription

## 📋 Introduction

Ce document décrit les **spécifications complètes** du processus d'inscription dans l'application UQO-Requests.

Le processus d'inscription permet à un nouvel utilisateur de créer un compte pour accéder à l'application.

---

## 🎯 Objectif

Permettre à un visiteur de créer un compte utilisateur avec :
- Un nom complet
- Une adresse email (unique)
- Un mot de passe sécurisé
- Attribution automatique du rôle "utilisateur"

---

## 📝 Formulaire d'Inscription

### Champs du formulaire

Le formulaire d'inscription contient **4 champs obligatoires** :

| Champ | Type | Obligatoire | Placeholder |
|-------|------|-------------|-------------|
| **Nom complet** | Texte | ✅ Oui | Jean Dupont |
| **Adresse email** | Email | ✅ Oui | jean.dupont@uqo.ca |
| **Mot de passe** | Password | ✅ Oui | ••••••••••••• |
| **Confirmation** | Password | ✅ Oui | ••••••••••••• |

### Bouton de soumission

- **Texte** : "Créer mon compte"
- **État désactivé** : Tant que le formulaire est invalide
- **État chargement** : Spinner pendant l'envoi

### Lien vers connexion

Sous le formulaire : "Déjà un compte ? Se connecter"

---

## ✅ Règles de Validation

### 1. Nom complet

**Règles :**
- ✅ **Requis** : Ne peut pas être vide
- ✅ **Minimum** : 3 caractères
- ✅ **Maximum** : 150 caractères
- ✅ **Format** : Lettres, espaces, tirets, apostrophes autorisés

**Messages d'erreur :**
- Vide : "Le nom complet est requis"
- < 3 caractères : "Le nom doit contenir au moins 3 caractères"
- > 150 caractères : "Le nom ne peut pas dépasser 150 caractères"

**Exemples valides :**
- ✅ "Jean Dupont"
- ✅ "Marie-Claire O'Connor"
- ✅ "José García-Martínez"

**Exemples invalides :**
- ❌ "" (vide)
- ❌ "JD" (< 3 caractères)
- ❌ "Jean123" (contient des chiffres)

---

### 2. Adresse email

**Règles :**
- ✅ **Requis** : Ne peut pas être vide
- ✅ **Format valide** : Doit respecter le format email standard
- ✅ **Unique** : L'email ne doit pas déjà exister en base de données
- ✅ **Domaine** : Aucune restriction de domaine (L1)

**Format email valide :**
```
nom@domaine.extension
```

**Messages d'erreur :**
- Vide : "L'adresse email est requise"
- Format invalide : "Format d'email invalide"
- Email existant (L2) : "Cette adresse email est déjà utilisée"

**Exemples valides :**
- ✅ "jean.dupont@uqo.ca"
- ✅ "marie@example.com"
- ✅ "user+test@domain.co.uk"

**Exemples invalides :**
- ❌ "" (vide)
- ❌ "jean.dupont" (pas de @)
- ❌ "jean@" (pas de domaine)
- ❌ "@uqo.ca" (pas de nom)

---

### 3. Mot de passe

**Règles :**
- ✅ **Requis** : Ne peut pas être vide
- ✅ **Minimum** : 8 caractères
- ✅ **Maximum** : Aucune limite (mais recommandé < 128)
- ✅ **Majuscule** : Au moins 1 lettre majuscule (A-Z)
- ✅ **Chiffre** : Au moins 1 chiffre (0-9)
- ✅ **Recommandé** : Caractères spéciaux (!@#$%^&*) pour plus de sécurité

**Messages d'erreur :**
- Vide : "Le mot de passe est requis"
- < 8 caractères : "Le mot de passe doit contenir au moins 8 caractères"
- Pas de majuscule : "Le mot de passe doit contenir au moins une majuscule"
- Pas de chiffre : "Le mot de passe doit contenir au moins un chiffre"

**Exemples valides :**
- ✅ "Password123"
- ✅ "MonMotDePasse2024"
- ✅ "Secure@Pass1"

**Exemples invalides :**
- ❌ "" (vide)
- ❌ "pass" (< 8 caractères)
- ❌ "password123" (pas de majuscule)
- ❌ "Password" (pas de chiffre)

---

### 4. Confirmation du mot de passe

**Règles :**
- ✅ **Requis** : Ne peut pas être vide
- ✅ **Identique** : Doit être strictement identique au mot de passe

**Messages d'erreur :**
- Vide : "La confirmation est requise"
- Différent : "Les mots de passe ne correspondent pas"

**Validation :**
```javascript
if (password !== passwordConfirmation) {
  error = "Les mots de passe ne correspondent pas"
}
```

---

## 🔄 Validation en Temps Réel

### Déclenchement

La validation s'effectue **à chaque modification** d'un champ (événement `onChange`).

### Affichage des erreurs

- **Couleur** : Rouge (#DC3545)
- **Icône** : ⚠️
- **Position** : Sous le champ concerné
- **Moment** : Dès que l'utilisateur quitte le champ

### Désactivation du bouton

Le bouton "Créer mon compte" est **désactivé** tant que :
- ❌ Un des champs est vide
- ❌ Une erreur de validation existe
- ❌ Les mots de passe ne correspondent pas

Le bouton est **activé** uniquement si :
- ✅ Tous les champs sont remplis
- ✅ Aucune erreur de validation
- ✅ Les mots de passe correspondent

---

## 📤 Processus de Soumission

### Étape 1 : Validation finale

Avant l'envoi, vérifier une dernière fois que :
1. Tous les champs sont valides
2. Les mots de passe correspondent
3. Aucun message d'erreur n'est affiché

### Étape 2 : Envoi de la requête

**Livrable L1 (Mock) :**
```javascript
// Simulation d'une requête
await new Promise(resolve => setTimeout(resolve, 1000))

// Simuler la création du compte
const newUser = {
  id: Date.now(),
  nom_complet: formData.nom_complet,
  email: formData.email,
  role: 'utilisateur',
  date_creation: new Date().toISOString()
}

console.log('Compte créé (simulé):', newUser)
```

**Livrable L2 (API réelle) :**
```javascript
const response = await fetch('/api/auth/register/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nom_complet: formData.nom_complet,
    email: formData.email,
    password: formData.password
  })
})

if (response.ok) {
  const data = await response.json()
  // data = { id, nom_complet, email, role }
} else if (response.status === 400) {
  const error = await response.json()
  // error.email = "Cette adresse email est déjà utilisée"
}
```

### Étape 3 : Traitement de la réponse

**En cas de succès (201 Created) :**
1. Afficher un message de succès
2. Rediriger vers `/login`
3. Passer un message de confirmation dans le state de navigation

**En cas d'erreur (400 Bad Request) :**
1. Afficher les erreurs sous les champs concernés
2. Ne pas rediriger
3. Permettre à l'utilisateur de corriger

**En cas d'erreur serveur (500) :**
1. Afficher un message générique
2. "Une erreur est survenue. Veuillez réessayer."

---

## 🎨 Interface Utilisateur

### Layout de la page

```
┌─────────────────────────────────────┐
│                                     │
│           [Logo/Titre]              │
│                                     │
│   ┌─────────────────────────────┐  │
│   │   Créer un compte           │  │
│   │                             │  │
│   │   Nom complet:              │  │
│   │   [__________________]      │  │
│   │                             │  │
│   │   Email:                    │  │
│   │   [__________________]      │  │
│   │                             │  │
│   │   Mot de passe:             │  │
│   │   [__________________]      │  │
│   │   ⚠️ [Message d'erreur]     │  │
│   │                             │  │
│   │   Confirmation:             │  │
│   │   [__________________]      │  │
│   │                             │  │
│   │   [Créer mon compte]        │  │
│   │                             │  │
│   │   Déjà un compte ?          │  │
│   │   Se connecter              │  │
│   └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### États visuels

**Champ normal :**
- Bordure : Gris clair (#E0E0E0)
- Background : Blanc (#FFFFFF)

**Champ focus :**
- Bordure : Bleu primaire (#667EEA)
- Box-shadow : Halo bleu léger

**Champ erreur :**
- Bordure : Rouge (#DC3545)
- Box-shadow : Halo rouge léger

**Bouton désactivé :**
- Background : Gris (#CCCCCC)
- Cursor : not-allowed
- Opacité : 0.6

**Bouton activé :**
- Background : Gradient bleu/violet
- Cursor : pointer
- Hover : Légère élévation

---

## 🔒 Sécurité

### Côté Frontend (L1)

**Validation stricte :**
- Vérifier tous les champs avant l'envoi
- Ne jamais envoyer un formulaire invalide
- Afficher des messages d'erreur clairs

**Pas de stockage du mot de passe :**
- ❌ Jamais dans localStorage
- ❌ Jamais dans sessionStorage
- ❌ Jamais dans les cookies (frontend)

### Côté Backend (L2)

**Hachage du mot de passe :**
```python
import bcrypt

# Hacher le mot de passe
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Stocker le hash (PAS le mot de passe en clair)
user.password = hashed
```

**Validation serveur :**
- Vérifier à nouveau tous les champs
- Vérifier l'unicité de l'email
- Retourner des erreurs appropriées

**Protection CSRF :**
- Token CSRF pour les requêtes POST (Django)
- Headers sécurisés

---

## 📊 Diagramme de Flux

```
┌─────────────┐
│ Utilisateur │
│ visite      │
│ /register   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ Affichage       │
│ formulaire vide │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Utilisateur     │
│ remplit champs  │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Validation      │
│ temps réel      │
└──────┬──────────┘
       │
   ┌───┴───┐
   │       │
   ↓       ↓
Erreur   Valide
   │       │
   ↓       ↓
Afficher  Activer
message   bouton
   │       │
   └───┬───┘
       │
       ↓
┌─────────────────┐
│ Clic "Créer"    │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Envoi requête   │
│ (L1: mock)      │
│ (L2: API)       │
└──────┬──────────┘
       │
   ┌───┴───┐
   │       │
   ↓       ↓
Succès  Erreur
   │       │
   ↓       ↓
Redirect Afficher
/login   erreur
```

---

## 🧪 Cas de Test

### Test 1 : Inscription valide

**Données :**
- Nom : "Jean Dupont"
- Email : "jean.dupont@uqo.ca"
- Password : "Password123"
- Confirmation : "Password123"

**Résultat attendu :**
- ✅ Pas d'erreur de validation
- ✅ Bouton activé
- ✅ Soumission réussie
- ✅ Redirection vers /login
- ✅ Message : "Votre compte a été créé avec succès !"

---

### Test 2 : Nom trop court

**Données :**
- Nom : "JD"
- Email : "jd@uqo.ca"
- Password : "Password123"
- Confirmation : "Password123"

**Résultat attendu :**
- ❌ Erreur : "Le nom doit contenir au moins 3 caractères"
- ❌ Bouton désactivé
- ❌ Pas de soumission possible

---

### Test 3 : Email invalide

**Données :**
- Nom : "Jean Dupont"
- Email : "jean.dupont"
- Password : "Password123"
- Confirmation : "Password123"

**Résultat attendu :**
- ❌ Erreur : "Format d'email invalide"
- ❌ Bouton désactivé

---

### Test 4 : Mot de passe trop court

**Données :**
- Nom : "Jean Dupont"
- Email : "jean@uqo.ca"
- Password : "Pass1"
- Confirmation : "Pass1"

**Résultat attendu :**
- ❌ Erreur : "Le mot de passe doit contenir au moins 8 caractères"
- ❌ Bouton désactivé

---

### Test 5 : Mots de passe différents

**Données :**
- Nom : "Jean Dupont"
- Email : "jean@uqo.ca"
- Password : "Password123"
- Confirmation : "Password456"

**Résultat attendu :**
- ❌ Erreur : "Les mots de passe ne correspondent pas"
- ❌ Bouton désactivé

---

## 📚 Références

- **POF Section 5.7 :** Processus d'inscription
- **Documentation A1 :** Parcours non-authentifié
- **Code U1 :** RegisterPage.jsx (Membre 1)
