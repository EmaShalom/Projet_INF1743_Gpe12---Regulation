// backend/src/migrations/001_create_tables.js — B2 (Membre 2)
// Création des 4 tables PostgreSQL définies dans docs/entites.md (A6, L1)
//
// Ordre obligatoire (contraintes de clés étrangères) :
//   1. users             → aucune dépendance
//   2. requests          → référence users
//   3. comments          → référence requests + users
//   4. status_history    → référence requests + users
//
// Pour exécuter : npm run migrate (voir run.js)
//

async function up(queryInterface, DataTypes) {

  // ──────────────────────────────────────────────────────────────
  // 1. TABLE users
  // ──────────────────────────────────────────────────────────────
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nom_complet: {    // Un seul champ — PAS nom + prenom (spec A7 L1)
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {       // Hash bcrypt — jamais exposé dans les réponses API
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {           // 'utilisateur' | 'gestionnaire' (A3)
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'utilisateur',
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
  // Index pour les requêtes fréquentes
  await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email_unique' });
  await queryInterface.addIndex('users', ['role'],  { name: 'users_role_idx' });

  // ──────────────────────────────────────────────────────────────
  // 2. TABLE requests
  // ──────────────────────────────────────────────────────────────
  await queryInterface.createTable('requests', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titre: {            // 5–200 chars (A8)
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {      // 20–2000 chars (A8)
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {             // Parmi les 7 types définis (A8)
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    statut: {           // SUBMITTED | IN_PROGRESS | RESOLVED | CLOSED (A4)
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'SUBMITTED',  // Initial toujours SUBMITTED
    },
    createur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',  // Supprimer les demandes si l'utilisateur est supprimé
    },
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
  });
  await queryInterface.addIndex('requests', ['createur_id'], { name: 'requests_createur_idx' });
  await queryInterface.addIndex('requests', ['statut'],      { name: 'requests_statut_idx' });
  await queryInterface.addIndex('requests', ['date_creation'], { name: 'requests_date_idx' });

  // ──────────────────────────────────────────────────────────────
  // 3. TABLE comments (entité définie dans A6, L1)
  // ──────────────────────────────────────────────────────────────
  await queryInterface.createTable('comments', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'requests', key: 'id' },
      onDelete: 'CASCADE',
    },
    auteur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date_creation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
  await queryInterface.addIndex('comments', ['request_id'],  { name: 'comments_request_idx' });
  await queryInterface.addIndex('comments', ['date_creation'], { name: 'comments_date_idx' });

  // ──────────────────────────────────────────────────────────────
  // 4. TABLE status_history (historique des transitions R3)
  // ──────────────────────────────────────────────────────────────
  await queryInterface.createTable('status_history', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'requests', key: 'id' },
      onDelete: 'CASCADE',
    },
    ancien_statut: {    // null lors de la création initiale de la demande
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nouveau_statut: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    modifie_par_id: {
      type: DataTypes.INTEGER,
      allowNull: true,  // null si l'utilisateur est supprimé
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    commentaire: {      // Commentaire optionnel du gestionnaire
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date_modification: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
  await queryInterface.addIndex('status_history', ['request_id'],        { name: 'history_request_idx' });
  await queryInterface.addIndex('status_history', ['date_modification'],  { name: 'history_date_idx' });

  console.log('✅ 4 tables créées : users, requests, comments, status_history');
}

// ── Rollback : suppression dans l'ordre inverse ──────────────────
async function down(queryInterface) {
  await queryInterface.dropTable('status_history');
  await queryInterface.dropTable('comments');
  await queryInterface.dropTable('requests');
  await queryInterface.dropTable('users');
  console.log('✅ 4 tables supprimées.');
}

module.exports = { up, down };
