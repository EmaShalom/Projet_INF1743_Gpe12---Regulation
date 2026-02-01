import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { validateEmail, validatePassword, validateName } from '../utils/validators'
import { ERROR_MESSAGES } from '../utils/constants'
import './RegisterPage.css'

const RegisterPage = () => {
  const navigate = useNavigate()
  
  // ==================== ÉTAT ====================
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  // ==================== VALIDATION ====================
  const validateField = (name, value) => {
    let error = ''
    
    switch(name) {
      case 'fullName':
        if (!value.trim()) {
          error = ERROR_MESSAGES.REQUIRED
        } else if (!validateName(value)) {
          error = ERROR_MESSAGES.NAME_TOO_SHORT
        }
        break
        
      case 'email':
        if (!value.trim()) {
          error = ERROR_MESSAGES.REQUIRED
        } else if (!validateEmail(value)) {
          error = ERROR_MESSAGES.EMAIL_INVALID
        }
        break
        
      case 'password':
        if (!value) {
          error = ERROR_MESSAGES.REQUIRED
        } else if (!validatePassword(value)) {
          if (value.length < 8) error = ERROR_MESSAGES.PASSWORD_TOO_SHORT
          else if (!/[A-Z]/.test(value)) error = ERROR_MESSAGES.PASSWORD_NO_UPPERCASE
          else if (!/[0-9]/.test(value)) error = ERROR_MESSAGES.PASSWORD_NO_NUMBER
        }
        break
        
      case 'passwordConfirmation':
        if (!value) {
          error = ERROR_MESSAGES.REQUIRED
        } else if (value !== formData.password) {
          error = ERROR_MESSAGES.PASSWORDS_DONT_MATCH
        }
        break
    }
    
    setErrors(prev => ({ ...prev, [name]: error }))
  }
  
  // ==================== GESTIONNAIRES ====================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation finale
    if (!isFormValid()) return
    
    setIsLoading(true)
    
    try {
      // L1 : Simuler un délai d'inscription
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // TODO L2 : Appeler l'API d'inscription
      // const response = await fetch('/api/auth/register/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     full_name: formData.fullName,
      //     email: formData.email,
      //     password: formData.password
      //   })
      // })
      
      console.log('Inscription réussie (simulée):', {
        fullName: formData.fullName,
        email: formData.email
      })
      
      // Rediriger vers login
      navigate('/login', { 
        state: { 
          message: 'Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.' 
        }
      })
      
    } catch (error) {
      console.error('Erreur inscription:', error)
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' })
    } finally {
      setIsLoading(false)
    }
  }
  
  const isFormValid = () => {
    return (
      validateName(formData.fullName) &&
      validateEmail(formData.email) &&
      validatePassword(formData.password) &&
      formData.password === formData.passwordConfirmation &&
      Object.values(errors).every(error => !error)
    )
  }
  
  // ==================== RENDU ====================
  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Créer un compte</h1>
          <p>Rejoignez UQO-Requests pour gérer vos demandes</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          {/* Nom complet */}
          <div className="form-group">
            <label htmlFor="fullName">
              Nom complet <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'input-error' : ''}
              placeholder="Jean Dupont"
              required
            />
            {errors.fullName && (
              <span className="error-message">
                ⚠️ {errors.fullName}
              </span>
            )}
          </div>
          
          {/* Email */}
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
            />
            {errors.email && (
              <span className="error-message">
                ⚠️ {errors.email}
              </span>
            )}
          </div>
          
          {/* Mot de passe */}
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
            />
            {errors.password && (
              <span className="error-message">
                ⚠️ {errors.password}
              </span>
            )}
            <span className="help-text">
              Minimum 8 caractères, 1 majuscule, 1 chiffre
            </span>
          </div>
          
          {/* Confirmation */}
          <div className="form-group">
            <label htmlFor="passwordConfirmation">
              Confirmer le mot de passe <span className="required">*</span>
            </label>
            <input
              type="password"
              id="passwordConfirmation"
              name="passwordConfirmation"
              value={formData.passwordConfirmation}
              onChange={handleChange}
              className={errors.passwordConfirmation ? 'input-error' : ''}
              placeholder="••••••••"
              required
            />
            {errors.passwordConfirmation && (
              <span className="error-message">
                ⚠️ {errors.passwordConfirmation}
              </span>
            )}
          </div>
          
          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}
          
          {/* Bouton */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Inscription en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>
        
        {/* Lien connexion */}
        <div className="register-footer">
          <p>
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage