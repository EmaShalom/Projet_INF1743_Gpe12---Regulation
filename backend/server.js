// backend/server.js — Point d'entrée du serveur
// Ce fichier est créé/géré par le chef de groupe
// Il assemble tous les routeurs produits par l'équipe
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { sequelize } = require('./src/entities');

const app = express();

// Accepter les requêtes du frontend Vite (port 5173)
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
const authRouter     = require('./src/api/auth');
const requestsRouter = require('./src/api/requests');
const commentsRouter = require('./src/api/comments');
const notificationsRouter = require('./src/api/notifications');

app.use('/api/auth',     authRouter);
app.use('/api/requests', requestsRouter);

// Commentaires imbriqués : /api/requests/:id/comments
// mergeParams: true dans comments.js permet d'accéder à :id
app.use('/api/requests/:id/comments', commentsRouter);

app.use('/api/notifications', notificationsRouter);

// Vérification de santé
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Route de test frontend ↔ backend
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend connecté avec succès 🚀'
  });
});

// 404 pour routes inconnues
app.use((req, res) => res.status(404).json({ error: 'Route introuvable.' }));

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connexion PostgreSQL OK');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré → http://localhost:${PORT}`);
      console.log(`   API Health     → http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Impossible de se connecter à PostgreSQL :', err.message);
    process.exit(1);
  });

module.exports = app;
