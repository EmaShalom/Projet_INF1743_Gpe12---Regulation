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

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setErrors({ email: "Format d'email invalide" })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const res = await api.post('/auth/forgot-password/', { email })
      setSuccessMessage(res.data?.message || 'Code envoyé !')
      setStep(2)
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Une erreur est survenue.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()

    if (code.trim().length !== 6) {
      setErrors({ code: 'Le code doit contenir 6 chiffres' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await api.post('/auth/verify-reset-code/', { email, code })
      setStep(3)
    } catch (error) {
      setErrors({ code: error.response?.data?.error || 'Code invalide ou expiré' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 8) {
      setErrors({ password: 'Le mot de passe doit contenir au moins 8 caractères' })
      return
    }

    if (password !== passwordConfirmation) {
      setErrors({ passwordConfirmation: 'Les mots de passe ne correspondent pas' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await api.post('/auth/reset-password/', { email, code, password })
      navigate('/login', {
        state: { message: 'Mot de passe réinitialisé avec succès ! Connectez-vous.' }
      })
    } catch (error) {
      const msg = error.response?.data?.error || 'Une erreur est survenue.'
      setErrors({ submit: msg })
      if (msg.includes('expiré') || msg.includes('invalide')) {
        setStep(2)
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
            <h1>Mot de passe oublié</h1>
            {step === 1 && <p>Entrez votre adresse email pour recevoir un code</p>}
            {step === 2 && <p>Entrez le code à 6 chiffres reçu par email</p>}
            {step === 3 && <p>Choisissez votre nouveau mot de passe</p>}
          </div>

          {successMessage && step === 2 && (
            <div className="success-message">✅ {successMessage}</div>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="login-form">
              <Input
                label="Adresse email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({}) }}
                placeholder="jean.dupont@uqo.ca"
                error={errors.email}
                required
                autoComplete="email"
              />
              {errors.submit && <div className="login-error">❌ {errors.submit}</div>}
              <div className="login-actions">
                <Button variant="secondary" type="button" onClick={() => navigate('/login')} disabled={isLoading}>
                  Retour
                </Button>
                <Button variant="primary" type="submit" loading={isLoading} disabled={!validateEmail(email) || isLoading}>
                  Envoyer le code
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleCodeSubmit} className="login-form">
              <p className="code-info">
                📧 Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.<br />
                Ce code est valide 15 minutes.
              </p>
              <Input
                label="Code de vérification"
                name="code"
                value={code}
                onChange={(e) => { setCode(e.target.value); setErrors({}) }}
                placeholder="123456"
                error={errors.code}
                required
                maxLength={6}
                autoComplete="one-time-code"
              />
              {errors.submit && <div className="login-error">❌ {errors.submit}</div>}
              <div className="login-actions">
                <Button variant="secondary" type="button" onClick={() => setStep(1)} disabled={isLoading}>
                  Retour
                </Button>
                <Button variant="primary" type="submit" loading={isLoading} disabled={code.trim().length !== 6 || isLoading}>
                  Vérifier le code
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="login-form">
              <Input
                label="Nouveau mot de passe"
                name="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({}) }}
                placeholder="••••••••"
                error={errors.password}
                required
                autoComplete="new-password"
              />
              <span className="help-text">Minimum 8 caractères</span>
              <Input
                label="Confirmer le mot de passe"
                name="passwordConfirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => { setPasswordConfirmation(e.target.value); setErrors({}) }}
                placeholder="••••••••"
                error={errors.passwordConfirmation}
                required
                autoComplete="new-password"
              />
              {errors.submit && <div className="login-error">❌ {errors.submit}</div>}
              <div className="login-actions">
                <Button variant="secondary" type="button" onClick={() => setStep(2)} disabled={isLoading}>
                  Retour
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={isLoading}
                  disabled={password.length < 8 || password !== passwordConfirmation || isLoading}
                >
                  Réinitialiser
                </Button>
              </div>
            </form>
          )}

          <div className="login-footer">
            <p>Retour à la <Link to="/login">connexion</Link></p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPasswordPage