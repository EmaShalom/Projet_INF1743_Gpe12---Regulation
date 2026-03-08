// backend/src/entities/Request.js — B1 (Membre 1)
// Entité demande — alignée sur docs/statuts.md (A4) + docs/entites.md (A6) + docs/specifications-demandes.md (A8)
//
// Statuts (A4) : SUBMITTED → IN_PROGRESS → RESOLVED → CLOSED
// Types   (A8) : 7 valeurs prédéfinies
// Statut initial : toujours SUBMITTED à la création (A8)
//
const { DataTypes } = require('sequelize');

// ── 4 statuts officiels (A4, L1) ─────────────────────────────
const STATUTS = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

// ── 7 types de demandes (A8, L1) ──────────────────────────────
const TYPES = [
  'Technique',
  'Bug',
  'Fonctionnalité',
  'Question',
  'Amélioration',
  'Performance',
  'Autre',
];

module.exports = (sequelize) => {
  const Request = sequelize.define('Request', {

    // ── Clé primaire ────────────────────────────────────────────
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // ── Titre (A8 : 5–200 chars) ─────────────────────────────────
    titre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le titre est requis.' },
        len: {
          args: [5, 200],
          msg: 'Le titre doit contenir entre 5 et 200 caractères.',
        },
      },
    },

    // ── Description (A8 : 20–2000 chars) ─────────────────────────
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La description est requise.' },
        len: {
          args: [20, 2000],
          msg: 'La description doit contenir entre 20 et 2000 caractères.',
        },
      },
    },

    // ── Type (A8 : parmi les 7 valeurs) ──────────────────────────
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [TYPES],
          msg: `Type invalide. Valeurs acceptées : ${TYPES.join(', ')}.`,
        },
      },
    },

    // ── Statut (A4) ───────────────────────────────────────────────
    // Défaut = SUBMITTED : tout commence ici
    statut: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'SUBMITTED',
      validate: {
        isIn: {
          args: [STATUTS],
          msg: `Statut invalide. Valeurs acceptées : ${STATUTS.join(', ')}.`,
        },
      },
    },

    // ── Clé étrangère créateur ────────────────────────────────────
    createur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ── Dates ────────────────────────────────────────────────────
    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    date_modification: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

  }, {
    tableName: 'requests',
    timestamps: false,
  });

  // ── Associations ──────────────────────────────────────────────
  Request.associate = (models) => {
    Request.belongsTo(models.User, { foreignKey: 'createur_id', as: 'createur' });
    Request.hasMany(models.Comment, { foreignKey: 'request_id', as: 'commentaires' });
    Request.hasMany(models.StatusHistory, { foreignKey: 'request_id', as: 'historique' });
  };

  return Request;
};

// Exporter les constantes pour réutilisation dans createRules.js / updateRules.js
module.exports.STATUTS = STATUTS;
module.exports.TYPES   = TYPES;
