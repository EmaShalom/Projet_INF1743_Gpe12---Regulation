// backend/src/api/requests.js — A1 (Membre 3) + A2 (Membre 4) + R3 (Membre 5)
// API REST complète pour les demandes
//
// Routes implémentées :
//   GET    /api/requests          → A1 (Membre 3) : liste filtrée selon le rôle
//   GET    /api/requests/:id      → A1 (Membre 3) : détail avec commentaires + historique
//   POST   /api/requests          → A1 (Membre 3) : création + historisation
//   PUT    /api/requests/:id      → A2 (Membre 4) : modification si SUBMITTED
//   PATCH  /api/requests/:id/status → R3 (Membre 5) : changement statut (gestionnaire)
//   DELETE /api/requests/:id      → A2 (Membre 4) : suppression si SUBMITTED
//
// NB : Ce fichier est partagé entre plusieurs membres.
//      Membre 3 implémente GET + POST.
//      Membres 4 et 5 ajoutent PUT, DELETE, PATCH.
//
const express = require('express');
const { authentifier, autoriser } = require('../middleware/authorize');
const { Request, User, Comment, StatusHistory } = require('../entities');
const { validerCreation }                        = require('../rules/createRules');
const { verifierDroitModification, validerModification } = require('../rules/updateRules');
const { verifierTransition, creerEntreeHistorique }      = require('../rules/statusRules');

const router = express.Router();

// Toutes les routes de ce fichier nécessitent un token valide
router.use(authentifier);

// ── Includes réutilisables ────────────────────────────────────────
const INCLUDE_CREATEUR = [
  { model: User, as: 'createur', attributes: ['id', 'nom_complet', 'email'] },
];

const INCLUDE_COMPLET = [
  { model: User, as: 'createur', attributes: ['id', 'nom_complet', 'email'] },
  {
    model: Comment,
    as: 'commentaires',
    include: [{ model: User, as: 'auteur', attributes: ['id', 'nom_complet', 'role'] }],
    order: [['date_creation', 'ASC']],
  },
  {
    model: StatusHistory,
    as: 'historique',
    include: [{ model: User, as: 'modifie_par', attributes: ['id', 'nom_complet'] }],
    order: [['date_modification', 'ASC']],
  },
];

// ════════════════════════════════════════════════════════════════
// A1 — Membre 3 : GET (liste + détail) + POST (création)
// ════════════════════════════════════════════════════════════════

// ── GET /api/requests ─────────────────────────────────────────
// • Gestionnaire → toutes les demandes (A3)
// • Utilisateur  → seulement ses demandes (A3)
router.get('/', async (req, res) => {
  try {
    // Filtre dynamique selon le rôle
    const where = req.user.role === 'gestionnaire'
      ? {}
      : { createur_id: req.user.id };

    const requests = await Request.findAll({
      where,
      include: INCLUDE_CREATEUR,
      order: [['date_creation', 'DESC']], // Plus récentes en premier
    });

    return res.status(200).json({
      requests,
      total: requests.length,
    });
  } catch (err) {
    console.error('[GET /requests]', err);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// ── GET /api/requests/:id ─────────────────────────────────────
// Détail complet : commentaires + historique des statuts
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: INCLUDE_COMPLET,
    });

    if (!request) {
      return res.status(404).json({ error: 'Demande introuvable.' });
    }

    // Utilisateur : accès refusé si pas propriétaire (A3)
    if (req.user.role === 'utilisateur' && request.createur_id !== req.user.id) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    return res.status(200).json({ request });
  } catch (err) {
    console.error('[GET /requests/:id]', err);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// ── POST /api/requests ────────────────────────────────────────
// Création d'une demande — statut initial TOUJOURS SUBMITTED (R1 / A8)
router.post('/', async (req, res) => {
  // Validation par les règles R1 (createRules.js)
  const { valide, erreurs, payload } = validerCreation(req.body, req.user.id);

  if (!valide) {
    return res.status(400).json({ erreurs });
  }

  try {
    const request = await Request.create(payload);

    // Historisation de la création (A6 / A8)
    // ancien_statut = null car c'est la première entrée
    await StatusHistory.create({
      request_id:    request.id,
      ancien_statut: null,
      nouveau_statut: 'SUBMITTED',
      modifie_par_id: req.user.id,
      commentaire:   'Demande créée',
      date_modification: new Date(),
    });

    // Retourner la demande avec les infos du créateur
    const requestComplete = await Request.findByPk(request.id, {
      include: INCLUDE_CREATEUR,
    });

    return res.status(201).json({
      message: 'Votre demande a été créée avec succès !',
      request: requestComplete,
    });
  } catch (err) {
    console.error('[POST /requests]', err);
    return res.status(500).json({ error: 'Une erreur est survenue lors de la création.' });
  }
});

// ════════════════════════════════════════════════════════════════
// A2 — Membre 4 : PUT (modification) + DELETE (suppression)
// ════════════════════════════════════════════════════════════════

// ── PUT /api/requests/:id ─────────────────────────────────────
// Modification autorisée UNIQUEMENT si statut = SUBMITTED (R2 / A8)
router.put('/:id', async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Demande introuvable.' });

    const droit = verifierDroitModification(request, req.user);
    if (!droit.autorise) return res.status(403).json({ error: droit.message });

    const { valide, erreurs, payload } = validerModification(req.body);
    if (!valide) return res.status(400).json({ erreurs });

    await request.update(payload);
    const requestMAJ = await Request.findByPk(request.id, { include: INCLUDE_CREATEUR });
    return res.status(200).json({ request: requestMAJ });
  } catch (err) {
    console.error('[PUT /requests/:id]', err);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// ── DELETE /api/requests/:id ──────────────────────────────────
// Suppression autorisée UNIQUEMENT si statut = SUBMITTED et propriétaire (A2 / A8)
router.delete('/:id', async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Demande introuvable.' });

    if (request.createur_id !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres demandes.' });
    }

    if (request.statut !== 'SUBMITTED') {
      return res.status(400).json({
        error: `Suppression impossible (statut : "${request.statut}"). Seules les demandes SUBMITTED peuvent être supprimées.`,
      });
    }

    await request.destroy();
    return res.status(200).json({ message: 'Demande supprimée avec succès.' });
  } catch (err) {
    console.error('[DELETE /requests/:id]', err);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// ════════════════════════════════════════════════════════════════
// R3 — Membre 5 : PATCH (changement de statut)
// ════════════════════════════════════════════════════════════════

// ── PATCH /api/requests/:id/status ───────────────────────────
// Réservé aux gestionnaires uniquement (A4 / R3)
router.patch('/:id/status', autoriser('gestionnaire'), async (req, res) => {
  const { statut, commentaire } = req.body;

  if (!statut) {
    return res.status(400).json({ error: 'Le champ "statut" est obligatoire.' });
  }

  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Demande introuvable.' });

    const transition = verifierTransition(request, statut, req.user);
    if (!transition.autorise) return res.status(403).json({ error: transition.message });

    const ancienStatut = request.statut;
    await request.update({ statut, date_modification: new Date() });

    // Enregistrement dans l'historique (R3 / A6)
    await StatusHistory.create({
      request_id:        request.id,
      ancien_statut:     ancienStatut,
      nouveau_statut:    statut,
      modifie_par_id:    req.user.id,
      commentaire:       commentaire || null,
      date_modification: new Date(),
    });

    return res.status(200).json({
      message: `Statut mis à jour : "${ancienStatut}" → "${statut}".`,
      request: { id: request.id, statut },
    });
  } catch (err) {
    console.error('[PATCH /requests/:id/status]', err);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

module.exports = router;
