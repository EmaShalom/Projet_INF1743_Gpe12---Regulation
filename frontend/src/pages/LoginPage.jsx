import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { validateEmail } from '../utils/validators'
import { authenticateUser } from '../mockData'
import './LoginPage.css'

import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const successMessage = location.state?.message

  // ✅ Étapes: 1 = email, 2 = mot de passe
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // BONUS UX
  const [showPassword, setShowPassword] = useState(false)

  // ==================== VALIDATION ====================
  const validateField = (name, value) => {
    let error = ''

    if (name === 'email') {
      if (!value.trim()) error = "L'adresse email est requise"
      else if (!validateEmail(value)) error = "Format d'email invalide"
    }

    if (name === 'password') {
      if (!value) error = 'Le mot de passe est requis'
      else if (value.length < 8) error = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  // ==================== HANDLERS ====================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)

    // Effacer l'erreur de connexion si l'utilisateur retape
    if (errors.login) setErrors((prev) => ({ ...prev, login: '' }))
  }

  const goNext = () => {
    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Format d'email invalide" }))
      return
    }
    setStep(2)
  }

  const goBack = () => {
    if (step === 1) navigate('/')
    else {
      setStep(1)
      setErrors((prev) => ({ ...prev, login: '' }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (step === 1) {
      goNext()
      return
    }

    if (!isFormValid()) return

    setIsLoading(true)
    setErrors({})

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = authenticateUser(formData.email, formData.password)

      if (user) {
        localStorage.setItem('token', 'mock-jwt-token-' + user.id)
        localStorage.setItem('user', JSON.stringify(user))

        navigate('/dashboard')
      } else {
        setErrors({ login: 'Email ou mot de passe incorrect' })
      }
    } catch (error) {
      console.error('Erreur connexion:', error)
      setErrors({ login: 'Une erreur est survenue. Veuillez réessayer.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <h1>Connexion</h1>
            <p>Accédez à votre compte UQO-Requests</p>
          </div>

          {successMessage && (
            <div className="success-message">✅ {successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {step === 1 && (
              <Input
                label="Adresse email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean.dupont@uqo.ca"
                error={errors.email}
                required
                autoComplete="email"
              />
            )}

            {step === 2 && (
              <div className="password-block">
                <Input
                  label="Mot de passe"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={isLoading}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            )}

            {step === 2 && errors.login && (
              <div className="login-error">❌ {errors.login}</div>
            )}

            <div className="login-actions">
              <Button
                variant="secondary"
                type="button"
                onClick={goBack}
                disabled={isLoading}
              >
                Retour
              </Button>

              {step === 1 ? (
                <Button
                  variant="primary"
                  type="button"
                  onClick={goNext}
                  disabled={!validateEmail(formData.email) || !!errors.email}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  variant="primary"
                  type="submit"
                  loading={isLoading}
                  disabled={!isFormValid() || isLoading}
                >
                  Connexion
                </Button>
              )}
            </div>
          </form>

          <div className="test-credentials">
            <p className="test-title">🧪 Identifiants de test (L1) :</p>
            <div className="test-accounts">
              <div className="test-account">
                <strong>Utilisateur :</strong><br />
                user@example.com / Password123
              </div>
              <div className="test-account">
                <strong>Gestionnaire :</strong><br />
                manager@example.com / Manager123
              </div>
            </div>
          </div>

          <div className="login-footer">
            <p>
              Pas encore de compte ? <Link to="/register">S'inscrire</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage