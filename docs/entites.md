# Modélisation des Entités

## 📋 Introduction

Ce document décrit les **4 entités principales** de la base de données PostgreSQL de l'application UQO-Requests.

Les entités sont :
1. **User** (Utilisateur)
2. **Request** (Demande)
3. **Comment** (Commentaire)
4. **StatusHistory** (Historique des statuts)

---

## 🗂️ Diagramme Entité-Relations (ERD)

```
┌─────────────────────┐
│       USER          │
│─────────────────────│
│ PK  id              │
│     nom_complet     │
│     email (UNIQUE)  │
│     password        │
│     role            │
│     date_creation   │
└──────┬──────────────┘
       │
       │ 1:N (crée)
       │
       ↓
┌─────────────────────┐
│      REQUEST        │
│─────────────────────│
│ PK  id              │
│     titre           │
│     description     │
│     type            │
│     statut          │
│ FK  createur_id     │
│     date_creation   │
│     date_modif      │
└──────┬──────────────┘
       │
   ┌───┴────┐
   │        │
   ↓        ↓
┌─────────┐ ┌──────────────┐
│ COMMENT │ │STATUS_HISTORY│
│─────────│ │──────────────│
│ PK  id  │ │ PK  id       │
│ FK  req │ │ FK  req      │
│ FK  aut │ │    ancien    │
│    cont │ │    nouveau   │
│    date │ │ FK  modif_par│
└─────────┘ │    date      │
            └──────────────┘
```

---

## 👤 Entité 1 : User (Utilisateur)

### Description

Représente un **utilisateur** de l'application (utilisateur standard ou gestionnaire).

### Attributs

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| **id** | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| **nom_complet** | VARCHAR(150) | NOT NULL | Nom complet de l'utilisateur |
| **email** | VARCHAR(255) | NOT NULL, UNIQUE | Adresse email (login) |
| **password** | VARCHAR(255) | NOT NULL | Mot de passe haché (bcrypt) |
| **role** | VARCHAR(50) | NOT NULL, DEFAULT 'utilisateur' | Rôle : 'utilisateur' ou 'gestionnaire' |
| **date_creation** | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date de création du compte |

### Table PostgreSQL

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom_complet VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'utilisateur',
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_role CHECK (role IN ('utilisateur', 'gestionnaire'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Relations

**1:N avec Request (créateur)**
- Un utilisateur peut créer **plusieurs demandes**
- Une demande est créée par **un seul utilisateur**
- Clé étrangère : `Request.createur_id` → `User.id`

**1:N avec Comment (auteur)**
- Un utilisateur peut écrire **plusieurs commentaires**
- Un commentaire est écrit par **un seul utilisateur**
- Clé étrangère : `Comment.auteur_id` → `User.id`

**1:N avec StatusHistory (modificateur)**
- Un gestionnaire peut modifier **plusieurs statuts**
- Une modification est faite par **un seul gestionnaire**
- Clé étrangère : `StatusHistory.modifie_par_id` → `User.id`

### Exemple de données

```json
{
  "id": 1,
  "nom_complet": "Jean Dupont",
  "email": "jean.dupont@uqo.ca",
  "password": "$2b$12$KIXxBv4zQ8...", 
  "role": "utilisateur",
  "date_creation": "2026-01-15T10:30:00Z"
}
```

---

## 📝 Entité 2 : Request (Demande)

### Description

Représente une **demande** soumise par un utilisateur (bug, fonctionnalité, question, etc.).

### Attributs

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| **id** | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| **titre** | VARCHAR(200) | NOT NULL | Titre de la demande |
| **description** | TEXT | NOT NULL | Description détaillée |
| **type** | VARCHAR(50) | NOT NULL | Type : Technique, Bug, Fonctionnalité, etc. |
| **statut** | VARCHAR(50) | NOT NULL, DEFAULT 'SUBMITTED' | Statut actuel |
| **createur_id** | INTEGER | NOT NULL, FOREIGN KEY | ID de l'utilisateur créateur |
| **date_creation** | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date de création |
| **date_modification** | TIMESTAMP | NOT NULL, DEFAULT NOW() | Dernière modification |

### Table PostgreSQL

```sql
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    createur_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_type CHECK (type IN (
        'Technique', 'Bug', 'Fonctionnalité', 
        'Question', 'Amélioration', 'Performance', 'Autre'
    )),
    CONSTRAINT check_statut CHECK (statut IN (
        'SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    ))
);

CREATE INDEX idx_requests_createur ON requests(createur_id);
CREATE INDEX idx_requests_statut ON requests(statut);
CREATE INDEX idx_requests_date ON requests(date_creation DESC);
```

### Relations

**N:1 avec User (créateur)**
- Plusieurs demandes créées par un utilisateur
- Clé étrangère : `createur_id` → `User.id`
- ON DELETE CASCADE

**1:N avec Comment**
- Une demande a plusieurs commentaires
- Relation : `Comment.request_id` → `Request.id`

**1:N avec StatusHistory**
- Une demande a plusieurs changements de statut
- Relation : `StatusHistory.request_id` → `Request.id`

---

## 💬 Entité 3 : Comment (Commentaire)

### Description

Représente un **commentaire** ajouté à une demande.

### Attributs

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| **id** | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| **request_id** | INTEGER | NOT NULL, FOREIGN KEY | ID de la demande |
| **auteur_id** | INTEGER | NOT NULL, FOREIGN KEY | ID de l'auteur |
| **contenu** | TEXT | NOT NULL | Contenu du commentaire |
| **date_creation** | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date de création |

### Table PostgreSQL

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    auteur_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_request ON comments(request_id);
CREATE INDEX idx_comments_date ON comments(date_creation DESC);
```

---

## 📊 Entité 4 : StatusHistory (Historique)

### Description

Représente l'**historique des changements de statut** d'une demande.

### Attributs

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| **id** | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique |
| **request_id** | INTEGER | NOT NULL, FOREIGN KEY | ID de la demande |
| **ancien_statut** | VARCHAR(50) | NOT NULL | Statut avant changement |
| **nouveau_statut** | VARCHAR(50) | NOT NULL | Statut après changement |
| **modifie_par_id** | INTEGER | FOREIGN KEY | ID du gestionnaire |
| **date_modification** | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date du changement |

### Table PostgreSQL

```sql
CREATE TABLE status_history (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    ancien_statut VARCHAR(50) NOT NULL,
    nouveau_statut VARCHAR(50) NOT NULL,
    modifie_par_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    date_modification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_request ON status_history(request_id);
CREATE INDEX idx_history_date ON status_history(date_modification DESC);
```

---

## 🔗 Résumé des Relations

| Relation | Type | Description |
|----------|------|-------------|
| User → Request | 1:N | Un utilisateur crée plusieurs demandes |
| User → Comment | 1:N | Un utilisateur écrit plusieurs commentaires |
| User → StatusHistory | 1:N | Un gestionnaire modifie plusieurs statuts |
| Request → Comment | 1:N | Une demande a plusieurs commentaires |
| Request → StatusHistory | 1:N | Une demande a plusieurs changements |

---

## 📝 Historique des Modifications

| Date | Version | Auteur | Modifications |
|------|---------|--------|---------------|
| 2026-01-31 | 1.0 | Membre 6 | Création initiale du document |

---

**Dernière mise à jour :** 31 janvier 2026  
**Auteur :** Membre 6 - [Votre nom]  
**Projet :** UQO-Requests - INF1743 L1  
**Statut :** ✅ Complet
```

**Enregistrer (Ctrl+S)**

---

### **ÉTAPE 4 : Commit et Push**

```bash
git add docs/entites.md
git commit -m "feat(A6): Add database entities modeling documentation

- Created docs/entites.md with 4 main entities
- Entity 1 (User): 6 attributes, 3 relationships
- Entity 2 (Request): 8 attributes, 3 relationships
- Entity 3 (Comment): 5 attributes, 2 relationships
- Entity 4 (StatusHistory): 6 attributes, 2 relationships
- Complete PostgreSQL DDL for all tables
- Indexes for performance (9 indexes)
- ERD diagram (ASCII art)
- Relationships summary table

Closes #16"

git push origin feat/a6-entites
```

---

### **ÉTAPE 5 : Créer la Pull Request**

```markdown
## 📝 Résumé
Cette PR ajoute la documentation des entités de la base de données.

## ✅ Changements
- [x] Création docs/entites.md
- [x] 4 entités documentées (User, Request, Comment, StatusHistory)
- [x] Diagramme ERD
- [x] Tables PostgreSQL complètes
- [x] Relations entre entités
- [x] Indexes de performance

## 🔗 Issue
Closes #16