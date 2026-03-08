const express = require('express');
const { authentifier } = require('../middleware/authorize');
const { Comment, Request, User } = require('../entities');

const router = express.Router();

router.use(authentifier);

// GET /api/notifications
// Retourne les commentaires écrits par des gestionnaires
// sur les demandes créées par l'utilisateur connecté.
router.get('/', async (req, res) => {
  try {
    // Un gestionnaire n'a pas besoin de cette vue filtrée
    if (req.user.role === 'gestionnaire') {
      return res.status(200).json({ notifications: [] });
    }

    const notifications = await Comment.findAll({
      include: [
        {
          model: User,
          as: 'auteur',
          attributes: ['id', 'nom_complet', 'role'],
          where: { role: 'gestionnaire' },
        },
        {
          model: Request,
          as: 'demande',
          attributes: ['id', 'titre', 'statut', 'createur_id'],
          where: { createur_id: req.user.id },
        },
      ],
      order: [['date_creation', 'DESC']],
    });

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error('[GET /notifications]', err);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

module.exports = router;