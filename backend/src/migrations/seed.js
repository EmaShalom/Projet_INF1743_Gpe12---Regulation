// backend/src/migrations/seed.js — B2 (Membre 2)
// Insertion de données de test pour faciliter le développement
//
// Exécuter : npm run seed
//
// Crée :
//   • 2 utilisateurs  : alice (utilisateur) + bob (gestionnaire)
//   • 3 demandes      : SUBMITTED, IN_PROGRESS, RESOLVED
//   • Historique      : entrées cohérentes pour chaque demande
//   • 2 commentaires  : sur la première demande
//
// Mot de passe pour tous : Password123!
//
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, Request, Comment, StatusHistory } = require('../entities');

const SALT_ROUNDS = 12;

async function seed() {
  // Vérifier la connexion DB avant de commencer
  await sequelize.authenticate();
  console.log('✅ Connexion DB OK — début du seed...');

  const hash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  // ── Utilisateurs ──────────────────────────────────────────────
  // Champ : nom_complet (spec A7 L1) — PAS nom + prenom séparés
  const alice = await User.create({
    nom_complet: 'Alice Dupont',
    email:       'alice@test.com',
    password:    hash,
    role:        'utilisateur',
  });

  const bob = await User.create({
    nom_complet: 'Bob Martin',
    email:       'bob@test.com',
    password:    hash,
    role:        'gestionnaire',
  });

  // ── Demandes ──────────────────────────────────────────────────
  // Statut initial = SUBMITTED (A8 / L1)
  const req1 = await Request.create({
    titre:       'Problème de connexion VPN',
    description: "Je n'arrive pas à me connecter au VPN depuis hier soir. Le client indique une erreur de certificat expiré.",
    type:        'Technique',
    statut:      'SUBMITTED',
    createur_id: alice.id,
  });

  const req2 = await Request.create({
    titre:       'Demande de formation React',
    description: "Souhait de suivre une formation React avancée pour améliorer les compétences front-end de toute l'équipe de développement.",
    type:        'Fonctionnalité',
    statut:      'IN_PROGRESS',
    createur_id: alice.id,
  });

  const req3 = await Request.create({
    titre:       'Bug affichage mobile dashboard',
    description: "Sur mobile (iPhone 14), le tableau de bord s'affiche mal. Les cartes se superposent et le menu est inaccessible.",
    type:        'Bug',
    statut:      'RESOLVED',
    createur_id: alice.id,
  });

  // ── Historique des statuts ────────────────────────────────────
  // req1 : créée → toujours SUBMITTED
  await StatusHistory.create({
    request_id:    req1.id,
    ancien_statut: null,          // null = création initiale
    nouveau_statut: 'SUBMITTED',
    modifie_par_id: alice.id,
    commentaire:   'Demande créée',
  });

  // req2 : créée → SUBMITTED → IN_PROGRESS (prise en charge par bob)
  await StatusHistory.create({
    request_id:    req2.id,
    ancien_statut: null,
    nouveau_statut: 'SUBMITTED',
    modifie_par_id: alice.id,
    commentaire:   'Demande créée',
  });
  await StatusHistory.create({
    request_id:    req2.id,
    ancien_statut: 'SUBMITTED',
    nouveau_statut: 'IN_PROGRESS',
    modifie_par_id: bob.id,
    commentaire:   "Prise en charge par l'équipe RH.",
  });

  // req3 : créée → SUBMITTED → IN_PROGRESS → RESOLVED (corrigée)
  await StatusHistory.create({
    request_id:    req3.id,
    ancien_statut: null,
    nouveau_statut: 'SUBMITTED',
    modifie_par_id: alice.id,
    commentaire:   'Demande créée',
  });
  await StatusHistory.create({
    request_id:    req3.id,
    ancien_statut: 'SUBMITTED',
    nouveau_statut: 'IN_PROGRESS',
    modifie_par_id: bob.id,
    commentaire:   'Je regarde le problème CSS.',
  });
  await StatusHistory.create({
    request_id:    req3.id,
    ancien_statut: 'IN_PROGRESS',
    nouveau_statut: 'RESOLVED',
    modifie_par_id: bob.id,
    commentaire:   'Corrigé. Mise à jour déployée.',
  });

  // ── Commentaires ──────────────────────────────────────────────
  await Comment.create({
    request_id: req1.id,
    auteur_id:  alice.id,
    contenu:    "Le problème persiste ce matin. J'ai essayé de réinstaller le client VPN sans succès.",
  });
  await Comment.create({
    request_id: req1.id,
    auteur_id:  bob.id,
    contenu:    "J'ai vu votre demande. Le certificat est en cours de renouvellement, ça devrait être réglé d'ici 2h.",
  });

  console.log('\n✅ Données de test insérées avec succès !');
  console.log('   alice@test.com   / Password123!  → utilisateur');
  console.log('   bob@test.com     / Password123!  → gestionnaire');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Erreur seed :', err.message);
  process.exit(1);
});
