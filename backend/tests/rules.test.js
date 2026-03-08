// backend/tests/rules.test.js — Tests métier (Membre 7)
// Tests Jest pour les règles R1, R2, R3
// Alignés sur docs/statuts.md (A4) + docs/specifications-demandes.md (A8)
//
// Lancer : npm test
// Résultat attendu : 19 tests passants
//
const { validerCreation }                                = require('../src/rules/createRules');
const { verifierDroitModification, validerModification } = require('../src/rules/updateRules');
const { verifierTransition }                             = require('../src/rules/statusRules');

const USER_ID  = 1; // Propriétaire de la demande dans les tests
const AUTRE_ID = 2; // Autre utilisateur / gestionnaire

// ══════════════════════════════════════════════════════════════════
// R1 — Création (validerCreation)
// ══════════════════════════════════════════════════════════════════
describe('R1 – validerCreation', () => {

  test('Données valides → statut forcé SUBMITTED, createur_id = userId', () => {
    const { valide, payload } = validerCreation(
      {
        titre:       'Titre valide',
        description: 'Description suffisamment longue pour passer la validation minimale.',
        type:        'Bug',
      },
      USER_ID
    );
    expect(valide).toBe(true);
    expect(payload.statut).toBe('SUBMITTED');      // Toujours SUBMITTED (A8)
    expect(payload.createur_id).toBe(USER_ID);     // Association automatique
  });

  test('Titre trop court (< 5 chars) → erreur', () => {
    const { valide, erreurs } = validerCreation(
      { titre: 'Ab', description: 'Description valide et longue.', type: 'Bug' },
      USER_ID
    );
    expect(valide).toBe(false);
    expect(erreurs.titre).toBeDefined();
  });

  test('Description trop courte (< 20 chars) → erreur', () => {
    const { valide, erreurs } = validerCreation(
      { titre: 'Titre ok', description: 'Trop court', type: 'Bug' },
      USER_ID
    );
    expect(valide).toBe(false);
    expect(erreurs.description).toBeDefined();
  });

  test('Type invalide (hors des 7 valeurs) → erreur', () => {
    const { valide } = validerCreation(
      { titre: 'Titre ok', description: 'Description suffisamment longue ici.', type: 'TypeInexistant' },
      USER_ID
    );
    expect(valide).toBe(false);
  });

  test('Type manquant → erreur', () => {
    const { valide, erreurs } = validerCreation(
      { titre: 'Titre ok', description: 'Description suffisamment longue ici.' },
      USER_ID
    );
    expect(valide).toBe(false);
    expect(erreurs.type).toBeDefined();
  });
});

// ══════════════════════════════════════════════════════════════════
// R2 — Modification (verifierDroitModification + validerModification)
// ══════════════════════════════════════════════════════════════════
describe('R2 – verifierDroitModification', () => {

  const demandeSubmitted  = { createur_id: USER_ID, statut: 'SUBMITTED' };
  const demandeInProgress = { createur_id: USER_ID, statut: 'IN_PROGRESS' };
  const demandeResolved   = { createur_id: USER_ID, statut: 'RESOLVED' };
  const demandeClosed     = { createur_id: USER_ID, statut: 'CLOSED' };

  test('Propriétaire + SUBMITTED → autorisé', () => {
    const { autorise } = verifierDroitModification(demandeSubmitted, { id: USER_ID });
    expect(autorise).toBe(true);
  });

  test('Non-propriétaire → refusé', () => {
    const { autorise } = verifierDroitModification(demandeSubmitted, { id: AUTRE_ID });
    expect(autorise).toBe(false);
  });

  test('IN_PROGRESS → modification refusée (A8)', () => {
    const { autorise } = verifierDroitModification(demandeInProgress, { id: USER_ID });
    expect(autorise).toBe(false);
  });

  test('RESOLVED → modification refusée', () => {
    const { autorise } = verifierDroitModification(demandeResolved, { id: USER_ID });
    expect(autorise).toBe(false);
  });

  test('CLOSED → modification refusée', () => {
    const { autorise } = verifierDroitModification(demandeClosed, { id: USER_ID });
    expect(autorise).toBe(false);
  });
});

describe('R2 – validerModification', () => {

  test('Champ statut interdit → erreur explicite', () => {
    const { valide } = validerModification({ statut: 'RESOLVED' });
    expect(valide).toBe(false);
  });

  test('Titre valide → payload correct', () => {
    const { valide, payload } = validerModification({ titre: 'Nouveau titre valide' });
    expect(valide).toBe(true);
    expect(payload.titre).toBe('Nouveau titre valide');
    expect(payload.date_modification).toBeInstanceOf(Date);
  });
});

// ══════════════════════════════════════════════════════════════════
// R3 — Changement de statut (verifierTransition)
// ══════════════════════════════════════════════════════════════════
describe('R3 – verifierTransition (A4, L1)', () => {

  // Demandes de test
  const demSub  = { statut: 'SUBMITTED' };
  const demProg = { statut: 'IN_PROGRESS' };
  const demRes  = { statut: 'RESOLVED' };
  const demClos = { statut: 'CLOSED' };

  // Acteurs
  const gestionnaire = { id: AUTRE_ID, role: 'gestionnaire' };
  const utilisateur  = { id: USER_ID,  role: 'utilisateur' };

  // ── Transitions valides ──────────────────────────────────────
  test('Gestionnaire : SUBMITTED → IN_PROGRESS ✓', () => {
    expect(verifierTransition(demSub, 'IN_PROGRESS', gestionnaire).autorise).toBe(true);
  });

  test('Gestionnaire : IN_PROGRESS → RESOLVED ✓', () => {
    expect(verifierTransition(demProg, 'RESOLVED', gestionnaire).autorise).toBe(true);
  });

  test('Gestionnaire : RESOLVED → CLOSED ✓', () => {
    expect(verifierTransition(demRes, 'CLOSED', gestionnaire).autorise).toBe(true);
  });

  test('Gestionnaire : RESOLVED → IN_PROGRESS (réouverture) ✓', () => {
    expect(verifierTransition(demRes, 'IN_PROGRESS', gestionnaire).autorise).toBe(true);
  });

  // ── Transitions interdites ───────────────────────────────────
  test('Utilisateur NE PEUT PAS changer un statut ✗', () => {
    const res = verifierTransition(demSub, 'IN_PROGRESS', utilisateur);
    expect(res.autorise).toBe(false);
    expect(res.message).toMatch(/gestionnaire/i);
  });

  test('SUBMITTED → RESOLVED interdit ✗', () => {
    expect(verifierTransition(demSub, 'RESOLVED', gestionnaire).autorise).toBe(false);
  });

  test('IN_PROGRESS → CLOSED interdit (doit passer par RESOLVED) ✗', () => {
    expect(verifierTransition(demProg, 'CLOSED', gestionnaire).autorise).toBe(false);
  });

  test('CLOSED est terminal — aucune transition possible ✗', () => {
    const res = verifierTransition(demClos, 'IN_PROGRESS', gestionnaire);
    expect(res.autorise).toBe(false);
    expect(res.message).toMatch(/fermée définitivement/i);
  });
});
