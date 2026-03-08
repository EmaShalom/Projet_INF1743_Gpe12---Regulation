import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { validateEmail } from '../utils/validators'
import api from '../services/api'
import './LoginPage.css'

import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const successMessage = location.state?.message

  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)

    if (errors.login) {
      setErrors((prev) => ({ ...prev, login: '' }))
    }
  }

  const goNext = () => {
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: "L'adresse email est requise" }))
      return
    }

    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Format d'email invalide" }))
      return
    }

    setStep(2)
  }

  const goBack = () => {
    if (step === 1) {
      navigate('/')
    } else {
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
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })

      const { token, user } = res.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      navigate('/dashboard')
    } catch (error) {
      console.error('Erreur connexion:', error)

      if (error.response?.status === 400 || error.response?.status === 401) {
        setErrors({ login: 'Email ou mot de passe incorrect' })
      } else {
        setErrors({ login: 'Une erreur est survenue. Veuillez réessayer.' })
      }
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
                  disabled={!formData.email.trim() || !!errors.email}
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
          <div className="auth-link-block">
             <Link to="/forgot-password">Mot de passe oublié ?</Link>
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