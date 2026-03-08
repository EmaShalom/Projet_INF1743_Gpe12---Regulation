// backend/src/entities/User.js — B1 (Membre 1)
// Entité utilisateur — alignée sur docs/entites.md (A6, L1)
//
// ⚠️  Champ : nom_complet (VARCHAR 150) — PAS nom + prenom séparés (spec A7 L1)
// ⚠️  id    : INTEGER SERIAL             — PAS UUID
// ⚠️  Scope par défaut : password EXCLU  — ne jamais exposer le hash
//
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {

    // ── Clé primaire ────────────────────────────────────────────
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // ── Nom complet (A6 : VARCHAR 150) ──────────────────────────
    // Attention : c'est UN seul champ, pas nom + prenom séparés
    nom_complet: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le nom complet est requis.' },
        len: {
          args: [3, 150],
          msg: 'Le nom doit contenir entre 3 et 150 caractères.',
        },
      },
    },

    // ── Email (unique) ──────────────────────────────────────────
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'Cette adresse email est déjà utilisée.' },
      validate: {
        isEmail:  { msg: "Format d'email invalide." },
        notEmpty: { msg: "L'adresse email est requise." },
      },
    },

    // ── Mot de passe (hash bcrypt) ──────────────────────────────
    // Ne jamais retourner ce champ dans les réponses API (voir defaultScope)
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // ── Rôle (A3 : utilisateur | gestionnaire) ──────────────────
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'utilisateur', // Toujours utilisateur à l'inscription (S1)
      validate: {
        isIn: {
          args: [['utilisateur', 'gestionnaire']],
          msg: 'Le rôle doit être "utilisateur" ou "gestionnaire".',
        },
      },
    },
    // ── Token de réinitialisation du mot de passe ──────────────────
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
   },

    // ── Date de création ────────────────────────────────────────
    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

  }, {
    tableName: 'users',
    timestamps: false, // On gère date_creation manuellement

    // ── Scope par défaut : password JAMAIS exposé ───────────────
    defaultScope: {
      attributes: { exclude: ['password'] },
    },

    // ── Scope spécial pour la connexion (S2 a besoin du hash) ───
    scopes: {
      withPassword: {
        attributes: {}, // Inclut TOUS les champs, password compris
      },
    },
  });

  // ── Associations ──────────────────────────────────────────────
  User.associate = (models) => {
    // Un utilisateur crée plusieurs demandes
    User.hasMany(models.Request, {
      foreignKey: 'createur_id',
      as: 'demandes',
    });
    // Un utilisateur écrit plusieurs commentaires
    User.hasMany(models.Comment, {
      foreignKey: 'auteur_id',
      as: 'commentaires',
    });
    // Un gestionnaire effectue plusieurs changements de statut
    User.hasMany(models.StatusHistory, {
      foreignKey: 'modifie_par_id',
      as: 'statuts_changes',
    });
  };

  return User;
};
