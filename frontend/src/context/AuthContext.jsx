// frontend/src/context/AuthContext.jsx — Contexte Auth (L1 mock + prêt pour L2 API)
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

export const AuthContext = createContext(null)

// Clés localStorage (centralisées)
const TOKEN_KEY = 'uqo_token'
const USER_KEY = 'uqo_user'

export function AuthProvider({ children }) {
  // État
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Init depuis localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Erreur parsing user localStorage:', e)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  // Helpers
  const estConnecte = Boolean(token && user)
  const estGestionnaire = user?.role === 'gestionnaire'

  // Connexion : L1 (mock)
  const login = useCallback(async (email, password) => {
    try {
      await new Promise((r) => setTimeout(r, 600))

      const mockUsers = [
        {
          id: 1,
          email: 'user@example.com',
          password: 'Password123',
          nom_complet: 'Jean Dupont',
          role: 'utilisateur',
        },
        {
          id: 2,
          email: 'manager@example.com',
          password: 'Manager123',
          nom_complet: 'Marie Gestionnaire',
          role: 'gestionnaire',
        },
      ]

      const found = mockUsers.find((u) => u.email === email && u.password === password)
      if (!found) throw new Error('Email ou mot de passe incorrect')

      const jwt = `mock-jwt-${Date.now()}`
      const userData = {
        id: found.id,
        email: found.email,
        nom_complet: found.nom_complet,
        role: found.role,
      }

      localStorage.setItem(TOKEN_KEY, jwt)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setToken(jwt)
      setUser(userData)

      return { success: true }
    } catch (err) {
      console.error('Erreur login:', err)
      return { success: false, error: err?.message || 'Une erreur est survenue' }
    }
  }, [])

  // Inscription : L1 (mock)
  const register = useCallback(async (nom_complet, email, password) => {
    try {
      await new Promise((r) => setTimeout(r, 600))

      // Simulation (à remplacer par API en L2)
      console.log('Inscription simulée:', { nom_complet, email })

      return { success: true }
    } catch (err) {
      console.error('Erreur register:', err)
      return { success: false, error: err?.message || 'Une erreur est survenue' }
    }
  }, [])

  // Connexion depuis token réel (appelé après verify-login API)
  const loginFromToken = useCallback((accessToken, userData) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }, [])

  // Mise à jour du profil en local (localStorage + état)
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem(USER_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Déconnexion : ne fait QUE vider (pas de navigation ici)
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => {
    return {
      // state
      token,
      user,
      isLoading,

      // booleans
      estConnecte,
      estGestionnaire,

      // actions
      login,
      loginFromToken,
      register,
      logout,
      updateUser,
    }
  }, [token, user, isLoading, estConnecte, estGestionnaire, login, loginFromToken, register, logout, updateUser])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div>Chargement...</div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth() doit être utilisé à l'intérieur de <AuthProvider>.")
  return ctx
}