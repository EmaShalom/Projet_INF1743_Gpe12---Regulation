import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { validatePassword } from '../utils/validators'
import { ERROR_MESSAGES } from '../utils/constants'
import api from '../services/api'
import './LoginPage.css'

import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') || ''

  const [formData, setFormData] = useState({
    password: '',
    confirmation: ''
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validateField = (name, value, currentPassword = formData.password) => {
    let error = ''

    if (name === 'password') {
      if (!value) error = ERROR_MESSAGES.REQUIRED
      else if (!validatePassword(value)) {
        if (value.length < 8) error = ERROR_MESSAGES.PASSWORD_TOO_SHORT
        else if (!/[A-Z]/.test(value)) error = ERROR_MESSAGES.PASSWORD_NO_UPPERCASE
        else if (!/[0-9]/.test(value)) error = ERROR_MESSAGES.PASSWORD_NO_NUMBER
      }
    }

    if (name === 'confirmation') {
      if (!value) error = ERROR_MESSAGES.REQUIRED
      else if (value !== currentPassword) error = ERROR_MESSAGES.PASSWORDS_DONT_MATCH
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      validateField(name, value, updated.password)

      if (name === 'password' && updated.confirmation) {
        validateField('confirmation', updated.confirmation, updated.password)
      }

      return updated
    })

    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }))
    }
  }

  const isFormValid = () => {
    return (
      token &&
      validatePassword(formData.password) &&
      formData.password === formData.confirmation &&
      !errors.password &&
      !errors.confirmation
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid()) return

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        password: formData.password,
        confirmation: formData.confirmation
      })

      setSuccessMessage(
        res.data?.message || 'Votre mot de passe a été réinitialisé avec succès.'
      )

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.'
          }
        })
      }, 1500)
    } catch (error) {
      console.error('Erreur reset password:', error)
      setErrors({
        submit: error.response?.data?.error || 'Le lien est invalide ou expiré.'
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
            <h1>Réinitialiser le mot de passe</h1>
            <p>Choisissez un nouveau mot de passe sécurisé</p>
          </div>

          {!token && (
            <div className="login-error">❌ Token manquant ou invalide.</div>
          )}

          {successMessage && (
            <div className="success-message">✅ {successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="password-block">
              <Input
                label="Nouveau mot de passe"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                required
                autoComplete="new-password"
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword((s) => !s)}
                disabled={isLoading}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>

              <span className="help-text">
                Minimum 8 caractères, 1 majuscule, 1 chiffre
              </span>
            </div>

            <Input
              label="Confirmer le mot de passe"
              name="confirmation"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmation}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmation}
              required
              autoComplete="new-password"
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
                Changer le mot de passe
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

export default ResetPasswordPage