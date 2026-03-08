// backend/src/auth/register.js — S1 (Membre 6)
// Endpoint d'inscription utilisateur
// Source : docs/specifications-inscription.md (A7, L1)
//
// POST /api/auth/register
//
// Validations :
//   - nom_complet : requis, 3–150 chars
//   - email       : requis, format valide, unique en base
//   - password    : requis, 8+ chars, 1 majuscule, 1 chiffre
//   - confirmation: doit correspondre au password
//
// Sécurité :
//   - Mot de passe haché avec bcrypt (12 rounds)
//   - Rôle attribué = 'utilisateur' TOUJOURS (jamais gestionnaire à l'inscription)
//   - Email dupliqué → 409 Conflict
//   - Succès → 201 Created (sans le hash du mot de passe)
//
const express = require('express');
const bcrypt  = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { User } = require('../entities');

const router = express.Router();
const SALT_ROUNDS = 12; // Minimum recommandé pour bcrypt

// ── Règles de validation express-validator ──────────────────────
const reglesValidation = [
  body('nom_complet')
    .trim()
    .notEmpty().withMessage('Le nom complet est requis.')
    .isLength({ min: 3 }).withMessage('Le nom doit contenir au moins 3 caractères.')
    .isLength({ max: 150 }).withMessage('Le nom ne peut pas dépasser 150 caractères.'),

  body('email')
    .trim()
    .notEmpty().withMessage("L'adresse email est requise.")
    .isEmail().withMessage("Format d'email invalide.")
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est obligatoire.')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.')
    .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule.')
    .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre.'),

  body('confirmation')
    .notEmpty().withMessage('La confirmation du mot de passe est requise.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas.');
      }
      return true;
    }),
];

// ── POST /api/auth/register ─────────────────────────────────────
router.post('/', reglesValidation, async (req, res) => {
  // 1. Vérifier les erreurs de validation express-validator
  const erreurs = validationResult(req);
  if (!erreurs.isEmpty()) {
    // Format : { erreurs: { champ: [message] } }
    const erreursFormatees = {};
    erreurs.array().forEach((e) => {
      if (!erreursFormatees[e.path]) erreursFormatees[e.path] = [];
      erreursFormatees[e.path].push(e.msg);
    });
    return res.status(400).json({ erreurs: erreursFormatees });
  }

  const { nom_complet, email, password } = req.body;

  try {
    // 2. Vérifier l'unicité de l'email (avant de hasher le mot de passe)
    const existant = await User.unscoped().findOne({ where: { email } });
    if (existant) {
      // 409 Conflict — email déjà utilisé
      return res.status(409).json({
        erreurs: { email: ['Cette adresse email est déjà utilisée.'] },
      });
    }

    // 3. Hachage du mot de passe
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Création de l'utilisateur
    // ⚠️  Rôle TOUJOURS 'utilisateur' — jamais 'gestionnaire' à l'inscription
    const user = await User.create({
      nom_complet,
      email,
      password: hash,
      role: 'utilisateur',
    });

    // 5. Réponse 201 — sans le hash du mot de passe
    return res.status(201).json({
      message: 'Inscription réussie.',
      user: {
        id:          user.id,
        nom_complet: user.nom_complet,
        email:       user.email,
        role:        user.role,
      },
    });

  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({
      error: "Une erreur est survenue lors de l'inscription.",
    });
  }
});

module.exports = router;
