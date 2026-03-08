// backend/src/rules/createRules.js — R1 (Membre 3)
// Règles métier pour la création d'une demande
// Source : docs/specifications-demandes.md (A8, L1)
//
// Règles appliquées :
//   • titre       : requis, 5–200 caractères
//   • description : requise, 20–2000 caractères
//   • type        : requis, parmi les 7 valeurs définies (A8)
//   • statut      : TOUJOURS forcé à "SUBMITTED" — l'utilisateur ne choisit jamais
//   • createur_id : fixé automatiquement à l'ID de l'utilisateur connecté
//
const { TYPES } = require('../entities/Request');

/**
 * Valide les données de création d'une demande.
 *
 * @param {Object} data    - Corps de la requête (req.body)
 * @param {number} userId  - ID de l'utilisateur authentifié (req.user.id)
 * @returns {{ valide: boolean, erreurs: Object, payload: Object|null }}
 *
 * @example
 * // Succès
 * validerCreation({ titre: 'Mon bug', description: 'Description assez longue...', type: 'Bug' }, 1)
 * // → { valide: true, erreurs: {}, payload: { titre: 'Mon bug', ..., statut: 'SUBMITTED', createur_id: 1 } }
 *
 * @example
 * // Échec
 * validerCreation({ titre: 'Ab' }, 1)
 * // → { valide: false, erreurs: { titre: ['...'], description: ['...'], type: ['...'] }, payload: null }
 */
function validerCreation(data, userId) {
  const erreurs = {};

  // ── Titre ────────────────────────────────────────────────────
  if (!data.titre || data.titre.trim() === '') {
    erreurs.titre = ['Le titre est requis.'];
  } else if (data.titre.trim().length < 5) {
    erreurs.titre = ['Le titre doit contenir au moins 5 caractères.'];
  } else if (data.titre.length > 200) {
    erreurs.titre = ['Le titre ne peut pas dépasser 200 caractères.'];
  }

  // ── Description ──────────────────────────────────────────────
  if (!data.description || data.description.trim() === '') {
    erreurs.description = ['La description est requise.'];
  } else if (data.description.trim().length < 20) {
    erreurs.description = ['La description doit contenir au moins 20 caractères.'];
  } else if (data.description.length > 2000) {
    erreurs.description = ['La description ne peut pas dépasser 2000 caractères.'];
  }

  // ── Type ─────────────────────────────────────────────────────
  if (!data.type) {
    erreurs.type = ['Le type est requis.'];
  } else if (!TYPES.includes(data.type)) {
    erreurs.type = [`Type invalide. Valeurs acceptées : ${TYPES.join(', ')}.`];
  }

  // ── Retour si erreurs ────────────────────────────────────────
  if (Object.keys(erreurs).length > 0) {
    return { valide: false, erreurs, payload: null };
  }

  // ── Payload nettoyé et sécurisé ──────────────────────────────
  // Statut TOUJOURS forcé à SUBMITTED, peu importe ce que l'utilisateur envoie
  const payload = {
    titre:             data.titre.trim(),
    description:       data.description.trim(),
    type:              data.type,
    statut:            'SUBMITTED',  // ⚠️ Jamais depuis data.statut
    createur_id:       userId,       // ⚠️ Jamais depuis data.createur_id
    date_creation:     new Date(),
    date_modification: new Date(),
  };

  return { valide: true, erreurs: {}, payload };
}

module.exports = { validerCreation };
