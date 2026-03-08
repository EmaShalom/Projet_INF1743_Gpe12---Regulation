// backend/src/migrations/run.js — B2 (Membre 2)
// Script d'exécution des migrations
// Lancer avec : npm run migrate
require('dotenv').config();
const { sequelize } = require('../entities');
const { QueryInterface } = require('sequelize');
const { DataTypes } = require('sequelize');
const migration = require('./001_create_tables');

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL OK');

    const queryInterface = sequelize.getQueryInterface();
    await migration.up(queryInterface, DataTypes);

    console.log('✅ Migration terminée avec succès !');
    console.log('   Prochaine étape : npm run seed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur migration :', err.message);
    process.exit(1);
  }
}

runMigrations();
