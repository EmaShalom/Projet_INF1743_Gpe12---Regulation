// backend/src/rules/statusRules.js — R3 (Membre 5)
// Règles de changement de statut et historisation
// Source : docs/statuts.md (A4, L1)
//
// ⚠️  RÈGLE FONDAMENTALE : L'utilisateur NE PEUT JAMAIS changer un statut.
//      Seul le GESTIONNAIRE contrôle toutes les transitions.
//
// Transitions autorisées (A4, L1) :
//   SUBMITTED   → IN_PROGRESS  (prise en charge)
//   IN_PROGRESS → RESOLVED     (problème résolu)
//   RESOLVED    → CLOSED       (fermé définitivement)
//   RESOLVED    → IN_PROGRESS  (réouverture si le problème réapparaît)
//
// Transitions INTERDITES :
//   SUBMITTED   → RESOLVED     (ne peut pas sauter IN_PROGRESS)
//   SUBMITTED   → CLOSED       (même raison)
//   IN_PROGRESS → CLOSED       (doit passer par RESOLVED d'abord)
//   IN_PROGRESS → SUBMITTED    (pas de retour en arrière)
//   RESOLVED    → SUBMITTED    (pas de retour en arrière)
//   CLOSED      → tout         (statut terminal — aucune action possible)
//

// Table de transition : pour chaque statut, liste des statuts cibles autorisés
const TRANSITIONS_GESTIONNAIRE = {
  SUBMITTED:   ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED:    ['CLOSED', 'IN_PROGRESS'], // Réouverture possible
  CLOSED:      [],                         // Terminal : aucune transition
};

/**
 * Vérifie si la transition de statut demandée est autorisée.
 *
 * @param {Object} demande        - Instance Request depuis la DB
 * @param {string} nouveauStatut  - Statut cible demandé
 * @param {Object} user           - { id, role }
 * @returns {{ autorise: boolean, message?: string }}
 *
 * @example
 * // Gestionnaire : SUBMITTED → IN_PROGRESS → autorisé
 * verifierTransition({ statut: 'SUBMITTED' }, 'IN_PROGRESS', { role: 'gestionnaire' })
 * // → { autorise: true }
 *
 * @example
 * // Utilisateur : toujours refusé
 * verifierTransition({ statut: 'SUBMITTED' }, 'IN_PROGRESS', { role: 'utilisateur' })
 * // → { autorise: false, message: 'Seul un gestionnaire...' }
 */
function verifierTransition(demande, nouveauStatut, user) {
  // ⚠️ Règle absolue : seul un gestionnaire peut modifier un statut
  if (user.role !== 'gestionnaire') {
    return {
      autorise: false,
      message: "Seul un gestionnaire peut modifier le statut d'une demande.",
    };
  }

  const statutActuel = demande.statut;
  const transitionsAutorisees = TRANSITIONS_GESTIONNAIRE[statutActuel] || [];

  // Vérifier si le statut cible est dans la liste des transitions autorisées
  if (!transitionsAutorisees.includes(nouveauStatut)) {
    // Message spécifique si la demande est déjà fermée
    if (statutActuel === 'CLOSED') {
      return {
        autorise: false,
        message: 'Cette demande est fermée définitivement. Aucune action possible.',
      };
    }

    return {
      autorise: false,
      message: `Transition invalide : "${statutActuel}" → "${nouveauStatut}". `
        + `Transitions autorisées depuis "${statutActuel}" : `
        + (transitionsAutorisees.length > 0 ? transitionsAutorisees.join(', ') : 'aucune') + '.',
    };
  }

  return { autorise: true };
}

/**
 * Construit le payload à insérer dans la table status_history.
 * Appelé systématiquement après chaque changement de statut (R3).
 *
 * @param {number}      requestId     - ID de la demande
 * @param {string|null} ancienStatut  - Statut avant le changement (null si création)
 * @param {string}      nouveauStatut - Nouveau statut
 * @param {number}      userId        - Gestionnaire (ou créateur à la création)
 * @param {string|null} [commentaire] - Commentaire optionnel du gestionnaire
 * @returns {Object} Payload prêt pour StatusHistory.create()
 */
function creerEntreeHistorique(requestId, ancienStatut, nouveauStatut, userId, commentaire = null) {
  return {
    request_id:        requestId,
    ancien_statut:     ancienStatut,
    nouveau_statut:    nouveauStatut,
    modifie_par_id:    userId,
    commentaire,
    date_modification: new Date(),
  };
}

module.exports = { verifierTransition, creerEntreeHistorique, TRANSITIONS_GESTIONNAIRE };
