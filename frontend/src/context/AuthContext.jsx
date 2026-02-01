import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Créer le contexte
export const AuthContext = createContext()

// Provider du contexte
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  
  // ==================== ÉTAT ====================
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // ==================== INITIALISATION ====================
  useEffect(() => {
    // Récupérer token et user du localStorage au chargement
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Erreur parsing user:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setIsLoading(false)
  }, [])
  
  // ==================== CONNEXION ====================
  const login = async (email, password) => {
    try {
      // L1 : Authentification mockée
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simuler une vérification des identifiants
      const mockUsers = [
        {
          id: 1,
          email: 'user@example.com',
          password: 'Password123',
          nom_complet: 'Jean Dupont',
          role: 'utilisateur'
        },
        {
          id: 2,
          email: 'manager@example.com',
          password: 'Manager123',
          nom_complet: 'Marie Gestionnaire',
          role: 'gestionnaire'
        }
      ]
      
      const foundUser = mockUsers.find(
        u => u.email === email && u.password === password
      )
      
      if (!foundUser) {
        throw new Error('Email ou mot de passe incorrect')
      }
      
      // Créer un faux token JWT
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      // Créer l'objet utilisateur (sans le password)
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        nom_complet: foundUser.nom_complet,
        role: foundUser.role
      }
      
      // Stocker dans localStorage
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Mettre à jour l'état
      setToken(mockToken)
      setUser(userData)
      
      // TODO L2 : Appeler l'API réelle
      // const response = await fetch('/api/auth/login/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Erreur de connexion')
      // }
      // 
      // const data = await response.json()
      // localStorage.setItem('token', data.token)
      // localStorage.setItem('user', JSON.stringify(data.user))
      // setToken(data.token)
      // setUser(data.user)
      
      return { success: true }
      
    } catch (error) {
      console.error('Erreur login:', error)
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue' 
      }
    }
  }
  
  // ==================== INSCRIPTION ====================
  const register = async (nom_complet, email, password) => {
    try {
      // L1 : Simulation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simuler la création du compte
      const newUser = {
        id: Date.now(),
        nom_complet,
        email,
        role: 'utilisateur'
      }
      
      console.log('Compte créé (simulé):', newUser)
      
      // TODO L2 : Appeler l'API réelle
      // const response = await fetch('/api/auth/register/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nom_complet, email, password })
      // })
      // 
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.message || 'Erreur d\'inscription')
      // }
      
      return { success: true }
      
    } catch (error) {
      console.error('Erreur register:', error)
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue' 
      }
    }
  }
  
  // ==================== DÉCONNEXION ====================
  const logout = () => {
    // Supprimer du localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Réinitialiser l'état
    setToken(null)
    setUser(null)
    
    // Rediriger vers login
    navigate('/login')
  }
  
  // ==================== VÉRIFICATION ====================
  const isAuthenticated = () => {
    return !!token && !!user
  }
  
  const isManager = () => {
    return user?.role === 'gestionnaire'
  }
  
  // ==================== VALEUR DU CONTEXTE ====================
  const value = {
    // État
    user,
    token,
    isLoading,
    
    // Fonctions
    login,
    register,
    logout,
    
    // Helpers
    isAuthenticated: isAuthenticated(),
    isManager: isManager()
  }
  
  // ==================== RENDU ====================
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div>Chargement...</div>
      </div>
    )
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}