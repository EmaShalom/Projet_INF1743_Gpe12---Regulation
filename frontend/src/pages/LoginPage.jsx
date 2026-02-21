import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { validateEmail } from '../utils/validators'
import { authenticateUser } from '../mockData'
import './LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Message de succès depuis la page d'inscription
  const successMessage = location.state?.message

  // ✅ Étapes: 1 = email, 2 = mot de passe
  const [step, setStep] = useState(1)
  
  // ==================== ÉTAT ====================
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  // ==================== VALIDATION ====================
  const validateField = (name, value) => {
    let error = ''
    
    if (name === 'email') {
      if (!value.trim()) {
        error = "L'adresse email est requise"
      } else if (!validateEmail(value)) {
        error = "Format d'email invalide"
      }
    }
    
    if (name === 'password') {
      if (!value) {
        error = 'Le mot de passe est requis'
      } else if (value.length < 8) {
        error = 'Le mot de passe doit contenir au moins 8 caractères'
      }
    }
    
    setErrors(prev => ({ ...prev, [name]: error }))
  }
  
  // ==================== GESTIONNAIRES ====================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
    
    // Effacer l'erreur de connexion si l'utilisateur retape
    if (errors.login) {
      setErrors(prev => ({ ...prev, login: '' }))
    }
  }

  const goNext = () => {
    // Valider email avant de passer à l'étape 2
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: "Format d'email invalide" }))
      return
    }
    setStep(2)
  }

  const goBack = () => {
    if (step === 1) {
      navigate('/') // Retour à la HomePage
    } else {
      setStep(1) // Retour à l'étape email
      setErrors(prev => ({ ...prev, login: '' }))
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    // ✅ Étape 1: ne pas soumettre, on passe à l'étape 2
    if (step === 1) {
      goNext()
      return
    }
    
    // Validation basique
    if (!validateEmail(formData.email) || formData.password.length < 8) {
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      // L1 : Authentification mockée
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user = authenticateUser(formData.email, formData.password)
      
      if (user) {
        // Authentification réussie
        // TODO L2 : Stocker le vrai token JWT
        localStorage.setItem('token', 'mock-jwt-token-' + user.id)
        localStorage.setItem('user', JSON.stringify(user))
        
        console.log('Connexion réussie (simulée):', user)
        
        // Rediriger vers dashboard
        navigate('/dashboard')
      } else {
        // Identifiants invalides
        setErrors({
          login: 'Email ou mot de passe incorrect'
        })
      }
      
      // TODO L2 : Appeler l'API de connexion
      // const response = await fetch('/api/auth/login/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password
      //   })
      // })
      
      // if (response.ok) {
      //   const data = await response.json()
      //   localStorage.setItem('token', data.token)
      //   localStorage.setItem('user', JSON.stringify(data.user))
      //   navigate('/dashboard')
      // } else {
      //   setErrors({ login: 'Email ou mot de passe incorrect' })
      // }
      
    } catch (error) {
      console.error('Erreur connexion:', error)
      setErrors({
        login: 'Une erreur est survenue. Veuillez réessayer.'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const isFormValid = () => {
    return (
      validateEmail(formData.email) &&
      formData.password.length >= 8 &&
      !errors.email &&
      !errors.password
    )
  }
  
  // ==================== RENDU ====================
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Connexion</h1>
          <p>Accédez à votre compte UQO-Requests</p>
        </div>
        
        {/* Message de succès depuis inscription */}
        {successMessage && (
          <div className="success-message">
            ✅ {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          {step === 1 && (
            <div className="form-group">
              <label htmlFor="email">
                Adresse email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                placeholder="jean.dupont@uqo.ca"
                required
                autoComplete="email"
              />
              {errors.email && (
                <span className="error-message">
                  ⚠️ {errors.email}
                </span>
              )}
            </div>
          )}
          
          {/* Mot de passe */}
          {step === 2 && (
            <div className="form-group">
              <label htmlFor="password">
                Mot de passe <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="error-message">
                  ⚠️ {errors.password}
                </span>
              )}
            </div>
          )}
          
          {/* Erreur de connexion */}
          {step === 2 && errors.login && (
            <div className="login-error">
              ❌ {errors.login}
            </div>
          )}
          
          {/* Bouton */}
          <div className="login-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={goBack}
              disabled={isLoading}
            >
              Retour
            </button>

            {step === 1 ? (
              <button
                type="button"
                className="primary-action"
                onClick={goNext}
                disabled={!validateEmail(formData.email) || !!errors.email}
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                className="primary-action"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Connexion en cours...
                  </>
                ) : (
                  'Connexion'
                )}
              </button>
            )}
          </div>
        </form>
        
        {/* Identifiants de test (L1 uniquement) */}
        <div className="test-credentials">
          <p className="test-title">🧪 Identifiants de test (L1) :</p>
          <div className="test-accounts">
            <div className="test-account">
              <strong>Utilisateur :</strong><br/>
              user@example.com / Password123
            </div>
            <div className="test-account">
              <strong>Gestionnaire :</strong><br/>
              manager@example.com / Manager123
            </div>
          </div>
        </div>
        
        {/* Lien inscription */}
        <div className="login-footer">
          <p>
            Pas encore de compte ? <Link to="/register">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage