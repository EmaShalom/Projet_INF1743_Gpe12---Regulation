/**
 * Données mockées pour le Livrable L1
 * Créé par le chef de groupe
 * 
 * IMPORTANT : Ces données seront remplacées par de vraies API au L2
 */

import { REQUEST_STATUS, USER_ROLES } from './utils/constants'

// Utilisateurs mockés
export const mockUsers = [
  {
    id: 1,
    nom_complet: 'Jean Dupont',
    email: 'user@example.com',
    password: 'Password123', // Ne JAMAIS stocker en clair dans un vrai projet !
    role: USER_ROLES.USER,
    date_creation: '2026-01-15T10:00:00Z'
  },
  {
    id: 2,
    nom_complet: 'Marie Gestionnaire',
    email: 'manager@example.com',
    password: 'Manager123',
    role: USER_ROLES.MANAGER,
    date_creation: '2026-01-10T09:00:00Z'
  }
]

// Demandes mockées
export const mockRequests = [
  {
    id: 1,
    titre: 'Problème de connexion au VPN',
    description: 'Je n\'arrive pas à me connecter au VPN de l\'université depuis ce matin. J\'ai essayé de redémarrer mon ordinateur mais le problème persiste.',
    type: 'Technique',
    statut: REQUEST_STATUS.SUBMITTED,
    createur_id: 1,
    date_creation: '2026-01-28T14:30:00Z',
    date_modification: '2026-01-28T14:30:00Z'
  },
  {
    id: 2,
    titre: 'Erreur 500 sur la page d\'accueil',
    description: 'Lorsque je clique sur "Mes cours", j\'obtiens une erreur 500. Le problème semble survenir uniquement sur Chrome.',
    type: 'Bug',
    statut: REQUEST_STATUS.IN_PROGRESS,
    createur_id: 1,
    date_creation: '2026-01-25T09:15:00Z',
    date_modification: '2026-01-27T16:20:00Z'
  },
  {
    id: 3,
    titre: 'Demande d\'accès à la salle informatique',
    description: 'Je souhaiterais avoir accès à la salle B-2105 pour travailler sur mon projet de session.',
    type: 'Question',
    statut: REQUEST_STATUS.RESOLVED,
    createur_id: 1,
    date_creation: '2026-01-20T11:00:00Z',
    date_modification: '2026-01-24T10:30:00Z'
  }
]

// Commentaires mockés
export const mockComments = [
  {
    id: 1,
    request_id: 2,
    auteur_id: 2,
    auteur_nom: 'Marie Gestionnaire',
    contenu: 'Nous avons identifié le problème. C\'est lié à une mise à jour récente du serveur.',
    date_creation: '2026-01-27T10:00:00Z'
  },
  {
    id: 2,
    request_id: 2,
    auteur_id: 1,
    auteur_nom: 'Jean Dupont',
    contenu: 'Merci pour la mise à jour. Est-ce que vous avez une estimation pour la résolution ?',
    date_creation: '2026-01-27T14:30:00Z'
  }
]

// Historique des statuts mockés
export const mockStatusHistory = [
  {
    id: 1,
    request_id: 2,
    ancien_statut: REQUEST_STATUS.SUBMITTED,
    nouveau_statut: REQUEST_STATUS.IN_PROGRESS,
    modifie_par_id: 2,
    modifie_par_nom: 'Marie Gestionnaire',
    date_modification: '2026-01-27T09:45:00Z'
  },
  {
    id: 2,
    request_id: 3,
    ancien_statut: REQUEST_STATUS.SUBMITTED,
    nouveau_statut: REQUEST_STATUS.IN_PROGRESS,
    modifie_par_id: 2,
    modifie_par_nom: 'Marie Gestionnaire',
    date_modification: '2026-01-21T10:00:00Z'
  },
  {
    id: 3,
    request_id: 3,
    ancien_statut: REQUEST_STATUS.IN_PROGRESS,
    nouveau_statut: REQUEST_STATUS.RESOLVED,
    modifie_par_id: 2,
    modifie_par_nom: 'Marie Gestionnaire',
    date_modification: '2026-01-24T10:30:00Z'
  }
]

// Fonction helper pour obtenir les demandes d'un utilisateur
export const getRequestsByUserId = (userId) => {
  return mockRequests.filter(req => req.createur_id === userId)
}

// Fonction helper pour obtenir une demande par ID
export const getRequestById = (requestId) => {
  return mockRequests.find(req => req.id === parseInt(requestId))
}

// Fonction helper pour obtenir les commentaires d'une demande
export const getCommentsByRequestId = (requestId) => {
  return mockComments.filter(comment => comment.request_id === parseInt(requestId))
}

// Fonction helper pour obtenir l'historique d'une demande
export const getStatusHistoryByRequestId = (requestId) => {
  return mockStatusHistory.filter(history => history.request_id === parseInt(requestId))
}

// Fonction helper pour authentifier un utilisateur (L1 mockée)
export const authenticateUser = (email, password) => {
  const user = mockUsers.find(u => u.email === email && u.password === password)
  if (user) {
    // Ne JAMAIS retourner le mot de passe !
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  return null
}