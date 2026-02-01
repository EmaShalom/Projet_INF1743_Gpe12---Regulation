/**
 * Constantes globales du projet
 * Créé par le chef de groupe
 */



// Types de demandes
export const REQUEST_TYPES = {
  TECHNIQUE: 'Technique',
  BUG: 'Bug',
  FEATURE: 'Fonctionnalité',
  QUESTION: 'Question',
  IMPROVEMENT: 'Amélioration',
  PERFORMANCE: 'Performance',
  OTHER: 'Autre'
}

// Statuts des demandes
export const REQUEST_STATUS = {
  SUBMITTED: 'SUBMITTED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
}

// Labels des statuts
export const STATUS_LABELS = {
  SUBMITTED: 'Soumis',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé'
}

// Couleurs des statuts (correspond aux variables CSS)
export const STATUS_COLORS = {
  SUBMITTED: '#ffc107',
  IN_PROGRESS: '#17a2b8',
  RESOLVED: '#28a745',
  CLOSED: '#6c757d'
}

// Rôles utilisateurs
export const USER_ROLES = {
  USER: 'utilisateur',
  MANAGER: 'gestionnaire'
}

// Identifiants de test (L1 uniquement)
export const TEST_CREDENTIALS = {
  USER: {
    email: 'user@example.com',
    password: 'Password123'
  },
  MANAGER: {
    email: 'manager@example.com',
    password: 'Manager123'
  }
}

// Limites de caractères
export const CHAR_LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 150,
  TITLE_MIN: 5,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 2000,
  PASSWORD_MIN: 8
}

// Messages d'erreur communs
export const ERROR_MESSAGES = {
  REQUIRED: 'Ce champ est requis',
  EMAIL_INVALID: 'Format d\'email invalide',
  PASSWORD_TOO_SHORT: `Le mot de passe doit contenir au moins ${CHAR_LIMITS.PASSWORD_MIN} caractères`,
  PASSWORD_NO_UPPERCASE: 'Le mot de passe doit contenir au moins une majuscule',
  PASSWORD_NO_NUMBER: 'Le mot de passe doit contenir au moins un chiffre',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas',
  NAME_TOO_SHORT: `Le nom doit contenir au moins ${CHAR_LIMITS.NAME_MIN} caractères`,
  NAME_TOO_LONG: `Le nom ne peut pas dépasser ${CHAR_LIMITS.NAME_MAX} caractères`
}