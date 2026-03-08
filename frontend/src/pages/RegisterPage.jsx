import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { validateEmail, validatePassword, validateName } from '../utils/validators'
import { ERROR_MESSAGES } from '../utils/constants'
import api from '../services/api'
import './RegisterPage.css'

import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'

const RegisterPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  })

  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'fullName':
        if (!value.trim()) error = ERROR_MESSAGES.REQUIRED
        else if (!validateName(value)) error = ERROR_MESSAGES.NAME_TOO_SHORT
        break

      case 'email':
        if (!value.trim()) error = ERROR_MESSAGES.REQUIRED
        else if (!validateEmail(value)) error = ERROR_MESSAGES.EMAIL_INVALID
        break

      case 'password':
        if (!value) error = ERROR_MESSAGES.REQUIRED
        else if (!validatePassword(value)) {
          if (value.length < 8) error = ERROR_MESSAGES.PASSWORD_TOO_SHORT
          else if (!/[A-Z]/.test(value)) error = ERROR_MESSAGES.PASSWORD_NO_UPPERCASE
          else if (!/[0-9]/.test(value)) error = ERROR_MESSAGES.PASSWORD_NO_NUMBER
        }
        break

      case 'passwordConfirmation':
        if (!value) error = ERROR_MESSAGES.REQUIRED
        else if (value !== formData.password) error = ERROR_MESSAGES.PASSWORDS_DONT_MATCH
        break

      default:
        break
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }))
    }

    validateField(name, value)

    if (name === 'password' && formData.passwordConfirmation) {
      const confirmationError =
        formData.passwordConfirmation !== value
          ? ERROR_MESSAGES.PASSWORDS_DONT_MATCH
          : ''

      setErrors((prev) => ({
        ...prev,
        passwordConfirmation: confirmationError
      }))
    }
  }

  const goNext = () => {
    if (step === 1) {
      const error = validateField('fullName', formData.fullName)
      if (error || !validateName(formData.fullName)) return
      setStep(2)
      return
    }

    if (step === 2) {
      const error = validateField('email', formData.email)
      if (error || !validateEmail(formData.email)) return
      setStep(3)
    }
  }

  const goBack = () => {
    if (step === 1) navigate('/')
    else if (step === 2) setStep(1)
    else setStep(2)
  }

  const isFormValid = () => {
    return (
      validateName(formData.fullName) &&
      validateEmail(formData.email) &&
      validatePassword(formData.password) &&
      formData.password === formData.passwordConfirmation &&
      !errors.fullName &&
      !errors.email &&
      !errors.password &&
      !errors.passwordConfirmation
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (step === 1 || step === 2) {
      goNext()
      return
    }

    if (!isFormValid()) return

    setIsLoading(true)
    setErrors({})

    try {
      await api.post('/auth/register', {
        nom_complet: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmation: formData.passwordConfirmation
      })

      navigate('/login', {
        state: {
          message: 'Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.'
        }
      })
    } catch (error) {
      console.error('Erreur inscription:', error)

      const data = error.response?.data

      if (error.response?.status === 400 && data?.erreurs) {
        setErrors({
          fullName: data.erreurs.nom_complet?.[0] || '',
          email: data.erreurs.email?.[0] || '',
          password: data.erreurs.password?.[0] || '',
          passwordConfirmation: data.erreurs.confirmation?.[0] || '',
          submit: ''
        })
      } else if (error.response?.status === 409 && data?.erreurs?.email) {
        setErrors({
          email: data.erreurs.email[0],
          submit: ''
        })
      } else {
        setErrors({
          submit: data?.error || "Une erreur est survenue. Veuillez réessayer."
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <Card className="register-card">
          <div className="register-header">
            <h1>Créer un compte</h1>
            <p>Rejoignez UQO-Requests pour gérer vos demandes</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {step === 1 && (
              <Input
                label="Nom complet"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jean Dupont"
                error={errors.fullName}
                required
                autoComplete="name"
              />
            )}

            {step === 2 && (
              <Input
                label="Adresse email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean.dupont@uqo.ca"
                error={errors.email}
                required
                autoComplete="email"
              />
            )}

            {step === 3 && (
              <>
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
                  name="passwordConfirmation"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.passwordConfirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.passwordConfirmation}
                  required
                  autoComplete="new-password"
                />
              </>
            )}

            {errors.submit && <div className="submit-error">{errors.submit}</div>}

            <div className="register-actions">
              <Button
                variant="secondary"
                type="button"
                onClick={goBack}
                disabled={isLoading}
              >
                Retour
              </Button>

              {step < 3 ? (
                <Button
                  variant="primary"
                  type="button"
                  onClick={goNext}
                  disabled={isLoading}
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
                  S&apos;inscrire
                </Button>
              )}
            </div>
          </form>

          <div className="register-footer">
            <p>
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage