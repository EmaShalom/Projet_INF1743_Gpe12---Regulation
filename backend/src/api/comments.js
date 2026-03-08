// backend/src/api/comments.js — A1/A2 commentaires (Membre 5)
// Endpoints pour les commentaires des demandes
// Source : docs/entites.md (A6, L1) + docs/statuts.md (A4, L1)
//
// Qui peut commenter :
//   - Utilisateur (propriétaire) : sur SES propres demandes uniquement
//   - Gestionnaire : sur TOUTES les demandes
//
// Règle de statut (A4) :
//   - CLOSED → commentaires interdits
//   - SUBMITTED, IN_PROGRESS, RESOLVED → commentaires autorisés
//
const express = require('express');
const { authentifier } = require('../middleware/authorize');
const { Comment, Request, User } = require('../entities');

// mergeParams: true permet d'accéder à req.params.id (l'ID de la demande)
// car ce routeur est monté sur '/api/requests/:id/comments' dans server.js
const router = express.Router({ mergeParams: true });
router.use(authentifier);

// ── GET /api/requests/:id/comments ────────────────────────────
// Liste tous les commentaires d'une demande (ordre chronologique)
router.get('/', async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    // Utilisateur : accès refusé si pas propriétaire
    if (req.user.role === 'utilisateur' && request.createur_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    const comments = await Comment.findAll({
      where: { request_id: req.params.id },
      include: [{
        model: User,
        as: 'auteur',
        attributes: ['id', 'nom_complet', 'role'],
      }],
      order: [['date_creation', 'ASC']], // Du plus ancien au plus récent
    });

    return res.status(200).json({ comments });
  } catch (err) {
    console.error('[GET /comments]', err);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// ── POST /api/requests/:id/comments ───────────────────────────
// Ajouter un commentaire sur une demande
router.post('/', async (req, res) => {
  const { contenu } = req.body;

  // Validation du contenu
  if (!contenu || contenu.trim() === '') {
    return res.status(400).json({
      erreurs: { contenu: ['Le contenu du commentaire est requis.'] },
    });
  }

  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    // Utilisateur : ne peut commenter que ses propres demandes
    if (req.user.role === 'utilisateur' && request.createur_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    // ⚠️ Commentaires interdits si statut = CLOSED (A4)
    if (request.statut === 'CLOSED') {
      return res.status(400).json({
        error: "Impossible d'ajouter un commentaire sur une demande fermée (CLOSED).",
      });
    }

    // Créer le commentaire
    const comment = await Comment.create({
      request_id: req.params.id,
      auteur_id:  req.user.id,
      contenu:    contenu.trim(),
    });

    // Retourner le commentaire complet avec l'auteur
    const commentComplet = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'auteur',
        attributes: ['id', 'nom_complet', 'role'],
      }],
    });

    return res.status(201).json({ comment: commentComplet });
  } catch (err) {
    console.error('[POST /comments]', err);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
