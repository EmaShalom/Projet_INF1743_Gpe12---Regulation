import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { validateEmail, validatePassword, validateName } from '../utils/validators'
import { ERROR_MESSAGES } from '../utils/constants'
import { useLang } from '../context/LanguageContext'
import api from '../services/api'
import logo from '../assets/logo.png'
import bg2 from '../assets/bg2.jpg'
import './LoginPage.css'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { t } = useLang()

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', passwordConfirmation: '' })
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
      default: break
    }
    setErrors(p => ({ ...p, [name]: error }))
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (errors.submit) setErrors(p => ({ ...p, submit: '' }))
    validateField(name, value)
    if (name === 'password' && formData.passwordConfirmation) {
      setErrors(p => ({ ...p, passwordConfirmation: formData.passwordConfirmation !== value ? ERROR_MESSAGES.PASSWORDS_DONT_MATCH : '' }))
    }
  }

  const goNext = () => {
    if (step === 1) {
      const err = validateField('fullName', formData.fullName)
      if (err || !validateName(formData.fullName)) return
      setStep(2)
    } else if (step === 2) {
      const err = validateField('email', formData.email)
      if (err || !validateEmail(formData.email)) return
      setStep(3)
    }
  }

  const goBack = () => {
    if (step === 1) navigate('/')
    else if (step === 2) setStep(1)
    else setStep(2)
  }

  const isFormValid = () =>
    validateName(formData.fullName) &&
    validateEmail(formData.email) &&
    validatePassword(formData.password) &&
    formData.password === formData.passwordConfirmation &&
    !Object.values(errors).some(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step < 3) { goNext(); return }
    if (!isFormValid()) return
    setIsLoading(true); setErrors({})
    try {
      await api.post('/auth/register/', {
        nom_complet: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmation: formData.passwordConfirmation
      })
      navigate('/login', { state: { message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' } })
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 400 && data?.erreurs) {
        setErrors({ fullName: data.erreurs.nom_complet?.[0] || '', email: data.erreurs.email?.[0] || '', password: data.erreurs.password?.[0] || '', passwordConfirmation: data.erreurs.confirmation?.[0] || '' })
      } else {
        setErrors({ submit: data?.error || "Une erreur est survenue. Veuillez réessayer." })
      }
    } finally { setIsLoading(false) }
  }

  const steps = [t.auth.step1, t.auth.step2, t.auth.step3.replace('Vérification', 'Mot de passe')]

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-bg-img" style={{ backgroundImage: `url(${bg2})` }} />
        <div className="auth-left-logo">
          <img src={logo} alt="UQO Requests" />
          <span className="auth-left-logo-name">UQO Requests</span>
        </div>
        <div className="auth-left-body">
          <div>
            <div className="auth-left-title">{t.auth.leftTitle}</div>
            <div className="auth-left-sub">{t.auth.leftSubtitle}</div>
          </div>
          <div className="auth-left-points">
            {[t.auth.leftPoint1, t.auth.leftPoint2, t.auth.leftPoint3].map((pt, i) => (
              <div className="auth-point" key={i}>
                <div className="auth-point-icon">✓</div>
                <span className="auth-point-text">{pt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-left-footer">© 2026 Université du Québec en Outaouais</div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1 className="auth-form-title">{t.auth.registerTitle}</h1>
            <p className="auth-form-subtitle">{t.auth.registerSubtitle}</p>
          </div>

          <div className="auth-steps">
            {steps.map((label, i) => {
              const n = i + 1; const isDone = step > n; const isActive = step === n
              return (
                <React.Fragment key={n}>
                  <div className={`auth-step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>
                    <div className="auth-step-dot">{isDone ? '✓' : n}</div>
                    <span>{label}</span>
                  </div>
                  {i < steps.length - 1 && <div className="auth-step-sep" />}
                </React.Fragment>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {step === 1 && (
              <div className="auth-field">
                <label className="auth-label">{t.auth.fullNameLabel}</label>
                <input
                  className={`auth-input${errors.fullName ? ' has-error' : ''}`}
                  name="fullName" value={formData.fullName} onChange={handleChange}
                  placeholder={t.auth.fullNamePlaceholder} autoComplete="name" autoFocus
                />
                {errors.fullName && <span className="auth-field-error">{errors.fullName}</span>}
              </div>
            )}

            {step === 2 && (
              <div className="auth-field">
                <label className="auth-label">{t.auth.emailLabel}</label>
                <input
                  className={`auth-input${errors.email ? ' has-error' : ''}`}
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder={t.auth.emailPlaceholder} autoComplete="email" autoFocus
                />
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>
            )}

            {step === 3 && (
              <>
                <div className="auth-field">
                  <label className="auth-label">{t.auth.passwordLabel}</label>
                  <div className="auth-input-wrap">
                    <input
                      className={`auth-input${errors.password ? ' has-error' : ''}`}
                      type={showPassword ? 'text' : 'password'}
                      name="password" value={formData.password} onChange={handleChange}
                      placeholder={t.auth.passwordPlaceholder}
                      autoComplete="new-password" style={{ paddingRight: '70px' }}
                    />
                    <button type="button" className="auth-input-suffix" onClick={() => setShowPassword(s => !s)}>
                      {showPassword ? t.auth.hide : t.auth.show}
                    </button>
                  </div>
                  {errors.password && <span className="auth-field-error">{errors.password}</span>}
                  <span className="auth-field-hint">{t.auth.passwordHint}</span>
                </div>
                <div className="auth-field">
                  <label className="auth-label">{t.auth.confirmPasswordLabel}</label>
                  <input
                    className={`auth-input${errors.passwordConfirmation ? ' has-error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    name="passwordConfirmation" value={formData.passwordConfirmation} onChange={handleChange}
                    placeholder={t.auth.passwordPlaceholder} autoComplete="new-password"
                  />
                  {errors.passwordConfirmation && <span className="auth-field-error">{errors.passwordConfirmation}</span>}
                </div>
              </>
            )}

            {errors.submit && <div className="auth-alert-error">⚠ {errors.submit}</div>}

            <div className="auth-actions">
              <button type="button" className="auth-btn auth-btn-secondary" onClick={goBack} disabled={isLoading}>
                {t.auth.back}
              </button>
              {step < 3 ? (
                <button type="button" className="auth-btn auth-btn-primary" onClick={goNext} disabled={isLoading}>
                  {t.auth.next}
                </button>
              ) : (
                <button type="submit" className="auth-btn auth-btn-primary" disabled={!isFormValid() || isLoading}>
                  {isLoading ? <><span className="spinner" /> Inscription...</> : t.auth.submitRegister}
                </button>
              )}
            </div>
          </form>

          <div className="auth-footer">
            {t.auth.hasAccount} <Link to="/login">{t.auth.signIn}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
