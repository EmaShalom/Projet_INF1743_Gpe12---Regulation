const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { User } = require('../entities');

const router = express.Router();

router.post(
  '/',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage("Format d'email invalide."),
  ],
  async (req, res) => {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        erreurs: erreurs.array().map((e) => e.msg),
      });
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(200).json({
          message: 'Si un compte existe avec cette adresse email, un lien de réinitialisation a été généré.',
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      user.reset_token = resetToken;
      user.reset_token_expires = expiresAt;
      await user.save();

      return res.status(200).json({
        message: 'Lien de réinitialisation généré avec succès.',
        resetToken,
        resetLink: `http://localhost:5173/reset-password?token=${resetToken}`,
      });
    } catch (err) {
      console.error('[forgot-password]', err);
      return res.status(500).json({
        error: 'Erreur interne du serveur.',
      });
    }
  }
);

module.exports = router;