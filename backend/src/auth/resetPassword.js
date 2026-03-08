const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { User } = require('../entities');

const router = express.Router();
const SALT_ROUNDS = 12;

router.post(
  '/',
  [
    body('token')
      .notEmpty()
      .withMessage('Token obligatoire.'),
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
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        erreurs: erreurs.array().map((e) => e.msg),
      });
    }

    const { token, password } = req.body;

    try {
      const user = await User.scope('withPassword').findOne({
        where: { reset_token: token },
      });

      if (!user) {
        return res.status(400).json({
          error: 'Token invalide ou expiré.',
        });
      }

      if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
        return res.status(400).json({
          error: 'Token invalide ou expiré.',
        });
      }

      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      user.password = hash;
      user.reset_token = null;
      user.reset_token_expires = null;

      await user.save();

      return res.status(200).json({
        message: 'Votre mot de passe a été réinitialisé avec succès.',
      });
    } catch (err) {
      console.error('[reset-password]', err);
      return res.status(500).json({
        error: 'Erreur interne du serveur.',
      });
    }
  }
);

module.exports = router;