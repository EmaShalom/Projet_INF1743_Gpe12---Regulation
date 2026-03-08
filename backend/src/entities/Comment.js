// backend/src/entities/Comment.js — B1 (Membre 1)
// Entité commentaire — alignée sur docs/entites.md (A6, L1)
//
// Un commentaire est lié à une demande (request_id) et écrit par un utilisateur (auteur_id).
// Commentaires interdits si statut = CLOSED (géré dans l'API, pas ici).
//
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Clé étrangère vers la demande concernée
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Clé étrangère vers l'auteur du commentaire
    auteur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Contenu du commentaire
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Le contenu du commentaire ne peut pas être vide.' },
        len: { args: [1, 2000], msg: 'Le commentaire doit faire entre 1 et 2000 caractères.' },
      },
    },

    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

  }, {
    tableName: 'comments',
    timestamps: false,
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Request, { foreignKey: 'request_id', as: 'demande' });
    Comment.belongsTo(models.User, { foreignKey: 'auteur_id', as: 'auteur' });
  };

  return Comment;
};
