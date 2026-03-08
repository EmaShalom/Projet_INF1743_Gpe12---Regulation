// backend/src/entities/StatusHistory.js — B1 (Membre 1)
// Entité historique des changements de statut — alignée sur docs/entites.md (A6, L1)
//
// Chaque fois qu'un gestionnaire change le statut d'une demande (R3),
// une entrée est créée ici pour tracer qui a fait quoi et quand.
//
// Cas particulier : à la CRÉATION d'une demande, ancien_statut = null
// (c'est la première entrée dans l'historique)
//
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StatusHistory = sequelize.define('StatusHistory', {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Demande concernée
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Statut précédent — null lors de la création de la demande
    ancien_statut: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // Nouveau statut après le changement
    nouveau_statut: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    // Gestionnaire (ou créateur lors de la création) qui a fait le changement
    // allowNull: true pour le cas où l'utilisateur est supprimé
    modifie_par_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Commentaire optionnel du gestionnaire lors du changement de statut
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    date_modification: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

  }, {
    tableName: 'status_history',
    timestamps: false,
  });

  StatusHistory.associate = (models) => {
    StatusHistory.belongsTo(models.Request, { foreignKey: 'request_id', as: 'demande' });
    StatusHistory.belongsTo(models.User, { foreignKey: 'modifie_par_id', as: 'modifie_par' });
  };

  return StatusHistory;
};
