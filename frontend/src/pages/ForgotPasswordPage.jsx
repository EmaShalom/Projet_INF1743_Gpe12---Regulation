import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { validateEmail } from '../utils/validators'
import api from '../services/api'
import './LoginPage.css'

import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    const value = e.target.value
    setEmail(value)

    let error = ''
    if (!value.trim()) error = "L'adresse email est requise"
    else if (!validateEmail(value)) error = "Format d'email invalide"

    setErrors((prev) => ({ ...prev, email: error, submit: '' }))
  }

  const isFormValid = () => {
    return validateEmail(email) && !errors.email
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid()) return

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const res = await api.post('/auth/forgot-password', { email })

      setSuccessMessage(
        res.data?.message || 'Un lien de réinitialisation a été envoyé.'
      )
    } catch (error) {
      console.error('Erreur forgot password:', error)
      setErrors({
        submit: error.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <h1>Mot de passe oublié</h1>
            <p>Entrez votre adresse email pour recevoir un lien de réinitialisation</p>
          </div>

          {successMessage && (
            <div className="success-message">✅ {successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Adresse email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="jean.dupont@uqo.ca"
              error={errors.email}
              required
              autoComplete="email"
            />

            {errors.submit && (
              <div className="login-error">❌ {errors.submit}</div>
            )}

            <div className="login-actions">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                Retour
              </Button>

              <Button
                variant="primary"
                type="submit"
                loading={isLoading}
                disabled={!isFormValid() || isLoading}
              >
                Envoyer le lien
              </Button>
            </div>
          </form>

          <div className="login-footer">
            <p>
              Retour à la <Link to="/login">connexion</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPasswordPage