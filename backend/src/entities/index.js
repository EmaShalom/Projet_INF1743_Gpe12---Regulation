// backend/src/entities/index.js — B1 (Membre 1)
// Configuration Sequelize + chargement des 4 modèles + application des associations
//
// Variables d'environnement requises (voir backend/.env.example) :
//   DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
//
const { Sequelize } = require('sequelize');

// ── Connexion PostgreSQL ─────────────────────────────────────────
const sequelize = new Sequelize(
  process.env.DB_NAME     || 'uqo_requests_db',
  process.env.DB_USER     || 'postgres',
  process.env.DB_PASSWORD || 'secret',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    process.env.DB_PORT || 5432,
    dialect: 'postgres',
    // Log SQL en développement seulement
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max:     10,
      min:     0,
      acquire: 30000,
      idle:    10000,
    },
  }
);

// ── Chargement des 4 modèles (A6, L1) ───────────────────────────
const User          = require('./User')(sequelize);
const Request       = require('./Request')(sequelize);
const Comment       = require('./Comment')(sequelize);
const StatusHistory = require('./StatusHistory')(sequelize);

const models = { User, Request, Comment, StatusHistory };

// ── Application des associations définies dans chaque entité ─────
Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = { sequelize, ...models };
