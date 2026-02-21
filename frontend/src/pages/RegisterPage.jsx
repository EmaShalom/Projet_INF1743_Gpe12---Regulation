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

  // ✅ Étapes: 1 = nom complet, 2 = email, 3 = mot de passe
  const [step, setStep] = useState(1)
  
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

    // ✅ si on change password, on re-valide la confirmation
    if (name === 'password' && formData.passwordConfirmation) {
      validateField('passwordConfirmation', formData.passwordConfirmation)
    }
  }

  const goNext = () => {
    if (step === 1) {
      validateField('fullName', formData.fullName)
      if (!validateName(formData.fullName) || errors.fullName) return
      setStep(2)
      return
    }

    if (step === 2) {
      validateField('email', formData.email)
      if (!validateEmail(formData.email) || errors.email) return
      setStep(3)
    }
  }

  const goBack = () => {
    if (step === 1) {
      navigate('/') // Retour Home
    } else if (step === 2) {
      setStep(1) // Retour à Nom complet
    } else {
      setStep(2) // Retour à Email
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    // ✅ Étape 1 et 2: on ne soumet pas, on avance
    if (step === 1 || step === 2) {
      goNext()
      return
    }
    
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
          {step === 1 && (
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
          )}
          
          {/* Email */}
          {step === 2 && (
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
          )}
          
          {/* Mot de passe */}
          {step === 3 && (
            <>
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
            </>
          )}
          
          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}
          
          {/* Bouton */}
          <div className="register-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={goBack}
              disabled={isLoading}
            >
              Retour
            </button>

            {step < 3 ? (
              <button
                type="button"
                className="primary-action"
                onClick={goNext}
                disabled={isLoading}
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
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            )}
          </div>
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