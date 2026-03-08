// backend/src/api/auth.js — Routeur d'authentification
// Regroupe les deux endpoints : inscription (S1) et connexion (S2)
//
// Monté dans server.js sur /api/auth
//   POST /api/auth/register → src/auth/register.js  (S1 – Membre 6)
//   POST /api/auth/login    → src/auth/login.js      (S2 – Membre 7)
//
const express = require('express');
const router  = express.Router();

router.use('/register', require('../auth/register'));
router.use('/login', require('../auth/login'));
router.use('/forgot-password', require('../auth/forgotPassword'));
router.use('/reset-password', require('../auth/resetPassword'));

module.exports = router;
