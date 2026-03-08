// backend/src/auth/login.js — S2 (Membre 7)
// Endpoint de connexion + génération du token JWT
//
// POST /api/auth/login
//
// Processus :
//   1. Valider email + password (format)
//   2. Chercher l'utilisateur par email (scope withPassword pour accéder au hash)
//   3. Comparer le mot de passe avec bcrypt
//   4. Générer un JWT signé avec JWT_SECRET
//
// Sécurité :
//   - Message d'erreur 401 IDENTIQUE qu'il s'agisse d'un email inconnu
//     ou d'un mauvais mot de passe (empêche l'énumération d'emails)
//   - Hash jamais retourné dans la réponse
//
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../entities');

const router = express.Router();

// ── POST /api/auth/login ────────────────────────────────────────
router.post('/',
  [
    body('email')
      .trim()
      .isEmail().withMessage("Format d'email invalide."),
    body('password')
      .notEmpty().withMessage('Mot de passe obligatoire.'),
  ],
  async (req, res) => {
    // Validation des formats
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        erreurs: erreurs.array().map((e) => e.msg),
      });
    }

    const { email, password } = req.body;

    try {
      // Chercher l'utilisateur avec son hash de mot de passe
      // (le scope par défaut exclut 'password' — on utilise withPassword)
      const user = await User.scope('withPassword').findOne({ where: { email } });

      // ⚠️ Message IDENTIQUE si email inconnu ou mauvais mot de passe
      // → Évite l'énumération d'emails (attaque par oracle)
      if (!user) {
        return res.status(401).json({ error: 'Identifiants invalides.' });
      }

      const passwordValide = await bcrypt.compare(password, user.password);
      if (!passwordValide) {
        return res.status(401).json({ error: 'Identifiants invalides.' });
      }

      // ── Génération du token JWT ──────────────────────────────
      // Payload minimal (ne jamais mettre de données sensibles dans le JWT)
      const payload = {
        sub:   user.id,    // Subject = ID de l'utilisateur
        email: user.email,
        role:  user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        issuer:    'uqo-requests',
      });

      // ── Réponse 200 — sans le hash du mot de passe ──────────
      return res.status(200).json({
        token,
        user: {
          id:          user.id,
          nom_complet: user.nom_complet,
          email:       user.email,
          role:        user.role,
        },
      });

    } catch (err) {
      console.error('[login]', err);
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  }
);

module.exports = router;
