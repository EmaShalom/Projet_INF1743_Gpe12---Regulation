// backend/src/rules/updateRules.js — R2 (Membre 4)
// Règles métier pour la modification d'une demande
// Source : docs/specifications-demandes.md (A8, L1)
//
// RÈGLE #1 — Propriété :
//   Seul le créateur peut modifier sa demande.
//   Un gestionnaire NE peut PAS modifier la demande d'un autre.
//
// RÈGLE #2 — Statut :
//   Modification autorisée UNIQUEMENT si statut = SUBMITTED.
//   Dès IN_PROGRESS, RESOLVED ou CLOSED → modification INTERDITE.
//
// RÈGLE #3 — Champs modifiables :
//   Seuls titre, description, type sont modifiables.
//   statut, createur_id, dates → bloqués.
//
const { TYPES } = require('../entities/Request');

// Seuls ces champs peuvent être envoyés dans le body d'un PUT
const CHAMPS_MODIFIABLES = ['titre', 'description', 'type'];

/**
 * Vérifie si l'utilisateur a le droit de modifier cette demande.
 *
 * @param {Object} demande - Instance Request depuis la DB
 * @param {Object} user    - { id, role }
 * @returns {{ autorise: boolean, message?: string }}
 *
 * @example
 * // Propriétaire + SUBMITTED → autorisé
 * verifierDroitModification({ createur_id: 1, statut: 'SUBMITTED' }, { id: 1 })
 * // → { autorise: true }
 *
 * @example
 * // Propriétaire + IN_PROGRESS → refusé
 * verifierDroitModification({ createur_id: 1, statut: 'IN_PROGRESS' }, { id: 1 })
 * // → { autorise: false, message: '...' }
 */
function verifierDroitModification(demande, user) {
  // RÈGLE #1 — Seul le créateur peut modifier
  if (demande.createur_id !== user.id) {
    return {
      autorise: false,
      message: "Vous n'êtes pas autorisé à modifier cette demande.",
    };
  }

  // RÈGLE #2 — Statut doit être SUBMITTED
  if (demande.statut !== 'SUBMITTED') {
    return {
      autorise: false,
      message: `Cette demande ne peut plus être modifiée car elle est en cours de traitement (statut actuel : "${demande.statut}").`,
    };
  }

  return { autorise: true };
}

/**
 * Valide les données de modification.
 * Seuls les champs titre, description, type sont acceptés.
 *
 * @param {Object} data - Corps de la requête (req.body)
 * @returns {{ valide: boolean, erreurs: Object, payload: Object|null }}
 */
function validerModification(data) {
  const erreurs = {};
  const payload = {};

  // RÈGLE #3 — Bloquer les champs non autorisés
  const champsInterdits = Object.keys(data).filter(
    (k) => !CHAMPS_MODIFIABLES.includes(k)
  );
  if (champsInterdits.length > 0) {
    return {
      valide: false,
      erreurs: {
        general: [`Champs non modifiables envoyés : ${champsInterdits.join(', ')}. Seuls titre, description et type sont modifiables.`],
      },
      payload: null,
    };
  }

  // ── Validation du titre (si fourni) ─────────────────────────
  if (data.titre !== undefined) {
    if (!data.titre || data.titre.trim().length < 5) {
      erreurs.titre = ['Le titre doit contenir au moins 5 caractères.'];
    } else if (data.titre.length > 200) {
      erreurs.titre = ['Le titre ne peut pas dépasser 200 caractères.'];
    } else {
      payload.titre = data.titre.trim();
    }
  }

  // ── Validation de la description (si fournie) ────────────────
  if (data.description !== undefined) {
    if (!data.description || data.description.trim().length < 20) {
      erreurs.description = ['La description doit contenir au moins 20 caractères.'];
    } else if (data.description.length > 2000) {
      erreurs.description = ['La description ne peut pas dépasser 2000 caractères.'];
    } else {
      payload.description = data.description.trim();
    }
  }

  // ── Validation du type (si fourni) ──────────────────────────
  if (data.type !== undefined) {
    if (!TYPES.includes(data.type)) {
      erreurs.type = [`Type invalide. Valeurs acceptées : ${TYPES.join(', ')}.`];
    } else {
      payload.type = data.type;
    }
  }

  // Aucun champ valide fourni (tous indéfinis)
  if (Object.keys(payload).length === 0 && Object.keys(erreurs).length === 0) {
    return {
      valide: false,
      erreurs: { general: ['Aucun champ valide à modifier fourni.'] },
      payload: null,
    };
  }

  if (Object.keys(erreurs).length > 0) {
    return { valide: false, erreurs, payload: null };
  }

  // Mise à jour automatique de date_modification
  payload.date_modification = new Date();

  return { valide: true, erreurs: {}, payload };
}

module.exports = { verifierDroitModification, validerModification, CHAMPS_MODIFIABLES };
