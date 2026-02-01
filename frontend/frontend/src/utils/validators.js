/**
 * Fonctions de validation
 * Créé par le chef de groupe
 */

import { CHAR_LIMITS } from './constants'

// Valider un email
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Valider un mot de passe
export const validatePassword = (password) => {
  if (!password || password.length < CHAR_LIMITS.PASSWORD_MIN) {
    return false
  }
  if (!/[A-Z]/.test(password)) {
    return false
  }
  if (!/[0-9]/.test(password)) {
    return false
  }
  return true
}

// Valider un nom
export const validateName = (name) => {
  const trimmed = name.trim()
  return trimmed.length >= CHAR_LIMITS.NAME_MIN && 
         trimmed.length <= CHAR_LIMITS.NAME_MAX
}

// Valider un titre de demande
export const validateTitle = (title) => {
  const trimmed = title.trim()
  return trimmed.length >= CHAR_LIMITS.TITLE_MIN && 
         trimmed.length <= CHAR_LIMITS.TITLE_MAX
}

// Valider une description
export const validateDescription = (description) => {
  const trimmed = description.trim()
  return trimmed.length >= CHAR_LIMITS.DESCRIPTION_MIN && 
         trimmed.length <= CHAR_LIMITS.DESCRIPTION_MAX
}