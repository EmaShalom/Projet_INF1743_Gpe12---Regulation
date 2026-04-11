-- ============================================================
--  UQO Requests — Script d'initialisation PostgreSQL
--  INF1743 Groupe 12 | Université du Québec en Outaouais
-- ============================================================
--
--  UTILISATION
--  -----------
--  Option A — psql interactif (connecté en tant que superutilisateur) :
--      psql -U postgres -f db_init.sql
--
--  Option B — commandes séparées :
--      1. psql -U postgres -f db_init.sql        (crée l'utilisateur + la BD)
--      2. cd backends && python manage.py migrate (crée les tables via Django)
--
--  AVERTISSEMENT
--  -------------
--  Le bloc \connect plus bas suppose que psql est utilisé.
--  Si vous utilisez un autre outil (DBeaver, pgAdmin, TablePlus),
--  exécutez les sections « PARTIE 1 » et « PARTIE 2 » séparément
--  depuis deux connexions différentes.
-- ============================================================


-- ============================================================
--  PARTIE 1 — Utilisateur et base de données
--  (à exécuter en tant que superutilisateur postgres)
-- ============================================================

-- ── Supprimer l'utilisateur s'il existe déjà (optionnel) ──
-- DROP USER IF EXISTS uqo_user;

-- ── Créer l'utilisateur applicatif ──────────────────────────
-- Remplacez 'MotDePasseSecret123' par un mot de passe sécurisé.
-- En développement, vous pouvez utiliser le superutilisateur
-- postgres existant et sauter cette étape.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'uqo_user') THEN
        CREATE USER uqo_user
            WITH PASSWORD 'MotDePasseSecret123'
            NOSUPERUSER
            NOCREATEDB
            NOCREATEROLE
            LOGIN;

        RAISE NOTICE 'Utilisateur uqo_user créé avec succès.';
    ELSE
        RAISE NOTICE 'Utilisateur uqo_user déjà existant — ignoré.';
    END IF;
END
$$;


-- ── Supprimer la base si elle existe déjà (optionnel) ───────
-- ATTENTION : supprime toutes les données existantes.
-- Décommentez uniquement pour une réinstallation complète.
-- DROP DATABASE IF EXISTS uqo_requests_db;


-- ── Créer la base de données ─────────────────────────────────
SELECT 'CREATE DATABASE uqo_requests_db
    WITH
    OWNER      = uqo_user
    ENCODING   = ''UTF8''
    LC_COLLATE = ''fr_CA.UTF-8''
    LC_CTYPE   = ''fr_CA.UTF-8''
    TEMPLATE   = template0
    CONNECTION LIMIT = -1'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'uqo_requests_db'
)\gexec

-- Si la locale fr_CA.UTF-8 n'est pas disponible sur votre système,
-- remplacez par 'en_US.UTF-8' ou 'C' :
--
--     LC_COLLATE = 'en_US.UTF-8'
--     LC_CTYPE   = 'en_US.UTF-8'


-- ── Accorder les privilèges ───────────────────────────────────
GRANT ALL PRIVILEGES ON DATABASE uqo_requests_db TO uqo_user;


-- ============================================================
--  PARTIE 2 — Schéma complet des tables applicatives
--  (à exécuter une fois connecté à uqo_requests_db)
--
--  IMPORTANT : Dans un flux normal, Django crée ces tables
--  automatiquement via :
--      python manage.py migrate
--
--  Ce bloc sert de :
--    • documentation du schéma de référence
--    • script de secours (restauration sans Django)
--    • support aux outils de migration externes (Flyway, Liquibase)
-- ============================================================

\connect uqo_requests_db uqo_user


-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- recherche plein texte
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- normalisation des accents


-- ────────────────────────────────────────────────────────────
--  TABLES SYSTÈME DJANGO
--  Créées par : python manage.py migrate
--  Listées ici pour documentation uniquement.
-- ────────────────────────────────────────────────────────────
--
--  django_migrations        — Historique des migrations appliquées
--  django_content_type      — Registre des modèles (utilisé par les permissions)
--  auth_permission          — Permissions atomiques (add/change/delete/view)
--  auth_group               — Groupes d'utilisateurs
--  auth_group_permissions   — Association groupes ↔ permissions
--  django_admin_log         — Journal des actions dans l'interface admin
--  django_session           — Sessions HTTP (si SessionMiddleware actif)
--


-- ────────────────────────────────────────────────────────────
--  TABLE : users_user
--  Modèle Django : apps.users.User (hérite de AbstractUser)
--  Rôle : comptes des étudiants et gestionnaires
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users_user (
    id              BIGINT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Champs hérités de AbstractUser (Django)
    password        VARCHAR(128)    NOT NULL,
    last_login      TIMESTAMPTZ     NULL,
    is_superuser    BOOLEAN         NOT NULL DEFAULT FALSE,
    first_name      VARCHAR(150)    NOT NULL DEFAULT '',
    last_name       VARCHAR(150)    NOT NULL DEFAULT '',
    is_staff        BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    date_joined     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Champs personnalisés
    email           VARCHAR(254)    NOT NULL,
    nom_complet     VARCHAR(150)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'utilisateur'
                        CHECK (role IN ('utilisateur', 'gestionnaire')),
    date_creation   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT users_user_email_key UNIQUE (email)
);

COMMENT ON TABLE  users_user               IS 'Comptes utilisateurs — étudiants et gestionnaires';
COMMENT ON COLUMN users_user.email         IS 'Identifiant de connexion (remplace username)';
COMMENT ON COLUMN users_user.nom_complet   IS 'Prénom et nom complets de l''utilisateur';
COMMENT ON COLUMN users_user.role          IS 'utilisateur | gestionnaire';
COMMENT ON COLUMN users_user.date_creation IS 'Date d''inscription au système';


-- ────────────────────────────────────────────────────────────
--  TABLE : users_user_groups
--  Relation M2M automatique : User ↔ auth_group
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users_user_groups (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id  BIGINT NOT NULL REFERENCES users_user (id)  ON DELETE CASCADE,
    group_id INT    NOT NULL
    -- group_id référence auth_group, créée par Django
);

COMMENT ON TABLE users_user_groups IS 'Association M2M utilisateurs ↔ groupes Django';


-- ────────────────────────────────────────────────────────────
--  TABLE : users_user_user_permissions
--  Relation M2M automatique : User ↔ auth_permission
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users_user_user_permissions (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users_user (id) ON DELETE CASCADE,
    permission_id INT    NOT NULL
    -- permission_id référence auth_permission, créée par Django
);

COMMENT ON TABLE users_user_user_permissions IS 'Association M2M utilisateurs ↔ permissions atomiques Django';


-- ────────────────────────────────────────────────────────────
--  TABLE : users_verificationcode
--  Modèle Django : apps.users.VerificationCode
--  Rôle : codes OTP pour la connexion 2FA et la réinitialisation
--         de mot de passe
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users_verificationcode (
    id         BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users_user (id) ON DELETE CASCADE,
    code       VARCHAR(6)  NOT NULL,
    type       VARCHAR(10) NOT NULL
                   CHECK (type IN ('login', 'reset')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN     NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE  users_verificationcode            IS 'Codes OTP à usage unique (2FA connexion + réinitialisation de mot de passe)';
COMMENT ON COLUMN users_verificationcode.code       IS 'Code à 6 chiffres envoyé par courriel';
COMMENT ON COLUMN users_verificationcode.type       IS 'login = authentification 2FA | reset = réinitialisation mot de passe';
COMMENT ON COLUMN users_verificationcode.expires_at IS 'Expiration du code (15 minutes après création)';
COMMENT ON COLUMN users_verificationcode.used       IS 'TRUE si le code a déjà été consommé (usage unique)';


-- ────────────────────────────────────────────────────────────
--  TABLE : requests_app_request
--  Modèle Django : apps.requests_app.Request
--  Rôle : demandes administratives soumises par les utilisateurs
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requests_app_request (
    id                BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titre             VARCHAR(200) NOT NULL,
    description       TEXT         NOT NULL,
    type              VARCHAR(50)  NOT NULL
                          CHECK (type IN (
                              'Technique', 'Bug', 'Fonctionnalité',
                              'Question', 'Amélioration', 'Performance', 'Autre'
                          )),
    statut            VARCHAR(50)  NOT NULL DEFAULT 'SUBMITTED'
                          CHECK (statut IN (
                              'SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
                          )),
    createur_id       BIGINT       NOT NULL REFERENCES users_user (id) ON DELETE CASCADE,
    date_creation     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  requests_app_request                   IS 'Demandes administratives des étudiants';
COMMENT ON COLUMN requests_app_request.type              IS 'Catégorie : Technique | Bug | Fonctionnalité | Question | Amélioration | Performance | Autre';
COMMENT ON COLUMN requests_app_request.statut            IS 'SUBMITTED → IN_PROGRESS → RESOLVED → CLOSED';
COMMENT ON COLUMN requests_app_request.createur_id       IS 'Étudiant ayant soumis la demande';
COMMENT ON COLUMN requests_app_request.date_modification IS 'Mis à jour automatiquement à chaque modification (auto_now Django)';


-- ────────────────────────────────────────────────────────────
--  TABLE : comments_comment
--  Modèle Django : apps.comments.Comment
--  Rôle : messages échangés sur une demande (utilisateur ↔ gestionnaire)
--         Sert également de source pour les notifications
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments_comment (
    id            BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contenu       TEXT        NOT NULL,
    date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    auteur_id     BIGINT      NOT NULL REFERENCES users_user (id)            ON DELETE CASCADE,
    demande_id    BIGINT      NOT NULL REFERENCES requests_app_request (id)  ON DELETE CASCADE
);

COMMENT ON TABLE  comments_comment          IS 'Commentaires/messages sur une demande — source des notifications';
COMMENT ON COLUMN comments_comment.auteur_id  IS 'Auteur du commentaire (utilisateur ou gestionnaire)';
COMMENT ON COLUMN comments_comment.demande_id IS 'Demande à laquelle le commentaire est rattaché';


-- ────────────────────────────────────────────────────────────
--  INDEX DE PERFORMANCE
-- ────────────────────────────────────────────────────────────

-- Connexion : recherche par email (index unique déjà créé, ajout d'un
-- index partiel sur les comptes actifs pour accélérer les authentifications)
CREATE INDEX IF NOT EXISTS idx_users_user_email_active
    ON users_user (email)
    WHERE is_active = TRUE;

-- Codes de vérification : nettoyage des codes expirés et non utilisés
CREATE INDEX IF NOT EXISTS idx_verificationcode_user_type
    ON users_verificationcode (user_id, type, used, expires_at);

-- Demandes : filtrage par statut (le plus fréquent dans l'interface)
CREATE INDEX IF NOT EXISTS idx_request_statut
    ON requests_app_request (statut);

-- Demandes : liste des demandes d'un utilisateur triée par date
CREATE INDEX IF NOT EXISTS idx_request_createur_date
    ON requests_app_request (createur_id, date_modification DESC);

-- Commentaires : chargement de tous les commentaires d'une demande
CREATE INDEX IF NOT EXISTS idx_comment_demande
    ON comments_comment (demande_id, date_creation ASC);

-- Commentaires : notifications non lues d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_comment_auteur
    ON comments_comment (auteur_id);

-- Recherche plein texte sur le titre (pg_trgm)
CREATE INDEX IF NOT EXISTS idx_request_titre_trgm
    ON requests_app_request USING GIN (titre gin_trgm_ops);


-- ────────────────────────────────────────────────────────────
--  ACCORDER LES PRIVILÈGES SUR LES TABLES
-- ────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO uqo_user;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA public TO uqo_user;

-- Privilèges par défaut pour les futures tables créées par Django migrate
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO uqo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT                  ON SEQUENCES TO uqo_user;


-- ============================================================
--  PARTIE 3 — Données de démarrage (développement)
--
--  OPTIONNEL — Fournit des comptes de test prêts à l'emploi.
--  NE PAS exécuter en production.
--
--  Mots de passe stockés en texte brut ici pour lisibilité ;
--  Django les hache via set_password() lors de la commande
--  createsuperuser ou d'un script de peuplement (seed).
--  Pour insérer directement en base, utilisez le hachage Django :
--      python -c "from django.contrib.auth.hashers import make_password; print(make_password('Password123'))"
-- ============================================================

-- Décommentez le bloc ci-dessous pour insérer des données de test :

/*
-- Utilisateur étudiant de test
INSERT INTO users_user
    (password, is_superuser, first_name, last_name, is_staff, is_active,
     date_joined, email, nom_complet, role, date_creation)
VALUES
    (
        -- Hachage de 'Password123' généré par Django
        'pbkdf2_sha256$600000$CHANGEME$CHANGEME=',
        FALSE, '', '', FALSE, TRUE,
        NOW(), 'etudiant@uqo.ca', 'Étudiant Test', 'utilisateur', NOW()
    )
ON CONFLICT (email) DO NOTHING;

-- Gestionnaire de test
INSERT INTO users_user
    (password, is_superuser, first_name, last_name, is_staff, is_active,
     date_joined, email, nom_complet, role, date_creation)
VALUES
    (
        'pbkdf2_sha256$600000$CHANGEME$CHANGEME=',
        FALSE, '', '', TRUE, TRUE,
        NOW(), 'gestionnaire@uqo.ca', 'Gestionnaire Test', 'gestionnaire', NOW()
    )
ON CONFLICT (email) DO NOTHING;

-- Superutilisateur admin Django
INSERT INTO users_user
    (password, is_superuser, first_name, last_name, is_staff, is_active,
     date_joined, email, nom_complet, role, date_creation)
VALUES
    (
        'pbkdf2_sha256$600000$CHANGEME$CHANGEME=',
        TRUE, 'Admin', 'UQO', TRUE, TRUE,
        NOW(), 'admin@uqo.ca', 'Admin UQO', 'gestionnaire', NOW()
    )
ON CONFLICT (email) DO NOTHING;
*/


-- ============================================================
--  RÉCAPITULATIF DES ÉTAPES DE DÉPLOIEMENT
-- ============================================================
--
--  1. psql -U postgres -f db_init.sql
--       → Crée l'utilisateur uqo_user, la base uqo_requests_db,
--         les tables applicatives, et les index.
--
--  2. Configurez le fichier backends/.env :
--       DB_NAME=uqo_requests_db
--       DB_USER=uqo_user
--       DB_PASSWORD=MotDePasseSecret123
--       DB_HOST=localhost
--       DB_PORT=5432
--
--  3. cd backends && python manage.py migrate
--       → Crée les tables système Django (auth_*, django_*)
--         et marque les migrations applicatives comme appliquées.
--
--  4. python manage.py createsuperuser
--       → Crée le premier compte administrateur interactif.
--
-- ============================================================
