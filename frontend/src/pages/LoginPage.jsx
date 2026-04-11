import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { validateEmail } from '../utils/validators'
import { useLang } from '../context/LanguageContext'
import api from '../services/api'
import logo from '../assets/logo.png'
import bg1 from '../assets/bg1.jpg'
import './LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginFromToken } = useAuth()
  const { t } = useLang()
  const successMessage = location.state?.message

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ email: '', password: '', code: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateField = (name, value) => {
    let error = ''
    if (name === 'email') {
      if (!value.trim()) error = t.auth.emailLabel + ' requis'
      else if (!validateEmail(value)) error = "Format d'email invalide"
    }
    if (name === 'password') {
      if (!value) error = 'Requis'
      else if (value.length < 8) error = 'Minimum 8 caractères'
    }
    if (name === 'code') {
      if (!value.trim()) error = 'Requis'
      else if (value.trim().length !== 6) error = '6 chiffres requis'
    }
    setErrors(p => ({ ...p, [name]: error }))
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    validateField(name, value)
    if (errors.login) setErrors(p => ({ ...p, login: '' }))
  }

  const goNext = () => {
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setErrors(p => ({ ...p, email: "Format d'email invalide" })); return
    }
    setStep(2)
  }

  const goBack = () => {
    if (step === 1) navigate('/')
    else if (step === 2) { setStep(1); setErrors({}) }
    else { setStep(2); setErrors({}) }
  }

  const isStep2Valid = () => validateEmail(formData.email) && formData.password.length >= 8

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1) { goNext(); return }

    if (step === 2) {
      if (!isStep2Valid()) return
      setIsLoading(true); setErrors({})
      try {
        await api.post('/auth/login/', { email: formData.email, password: formData.password })
        setStep(3)
      } catch (err) {
        setErrors({ login: err.response?.status === 401 ? 'Email ou mot de passe incorrect' : 'Une erreur est survenue.' })
      } finally { setIsLoading(false) }
      return
    }

    if (step === 3) {
      if (formData.code.trim().length !== 6) return
      setIsLoading(true); setErrors({})
      try {
        const res = await api.post('/auth/verify-login/', { email: formData.email, code: formData.code })
        const { token, refresh, user } = res.data
        if (refresh) localStorage.setItem('refresh', refresh)
        loginFromToken(token, user)
        navigate('/dashboard')
      } catch (err) {
        setErrors({ login: err.response?.status === 400 ? 'Code invalide ou expiré' : 'Une erreur est survenue.' })
      } finally { setIsLoading(false) }
    }
  }

  const steps = [t.auth.step1, t.auth.step2, t.auth.step3]

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-bg-img" style={{ backgroundImage: `url(${bg1})` }} />
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
                <div className="auth-point-icon">{'✓'}</div>
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
            <h1 className="auth-form-title">{t.auth.loginTitle}</h1>
            <p className="auth-form-subtitle">{t.auth.loginSubtitle}</p>
          </div>

          {/* Step indicators */}
          <div className="auth-steps">
            {steps.map((label, i) => {
              const n = i + 1
              const isDone = step > n
              const isActive = step === n
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

          {successMessage && (
            <div className="auth-alert-success">✅ {successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {step === 1 && (
              <div className="auth-field">
                <label className="auth-label">{t.auth.emailLabel}</label>
                <div className="auth-input-wrap">
                  <input
                    className={`auth-input${errors.email ? ' has-error' : ''}`}
                    type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder={t.auth.emailPlaceholder}
                    autoComplete="email" autoFocus
                  />
                </div>
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>
            )}

            {step === 2 && (
              <div className="auth-field">
                <label className="auth-label">{t.auth.passwordLabel}</label>
                <div className="auth-input-wrap">
                  <input
                    className={`auth-input${errors.password ? ' has-error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={formData.password} onChange={handleChange}
                    placeholder={t.auth.passwordPlaceholder}
                    autoComplete="current-password" style={{ paddingRight: '70px' }}
                  />
                  <button type="button" className="auth-input-suffix" onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? t.auth.hide : t.auth.show}
                  </button>
                </div>
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
                <div className="auth-forgot">
                  <Link to="/forgot-password">{t.auth.forgotPassword}</Link>
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="auth-code-info">📧 {t.auth.codeInfo.replace('votre', formData.email ? `${formData.email} —` : 'votre')}</div>
                <div className="auth-field">
                  <label className="auth-label">{t.auth.codeLabel}</label>
                  <input
                    className={`auth-input${errors.code ? ' has-error' : ''}`}
                    name="code" value={formData.code} onChange={handleChange}
                    placeholder={t.auth.codePlaceholder}
                    maxLength={6} autoComplete="one-time-code" autoFocus
                    style={{ letterSpacing: '0.2em', fontSize: 'var(--text-lg)', textAlign: 'center' }}
                  />
                  {errors.code && <span className="auth-field-error">{errors.code}</span>}
                </div>
              </>
            )}

            {errors.login && <div className="auth-alert-error">⚠ {errors.login}</div>}

            <div className="auth-actions">
              <button type="button" className="auth-btn auth-btn-secondary" onClick={goBack} disabled={isLoading}>
                {t.auth.back}
              </button>
              {step < 3 ? (
                <button
                  type="button" className="auth-btn auth-btn-primary"
                  onClick={step === 1 ? goNext : handleSubmit}
                  disabled={(step === 1 && (!formData.email || !!errors.email)) || (step === 2 && (!isStep2Valid() || isLoading))}
                >
                  {isLoading ? <><span className="spinner" /> Connexion...</> : t.auth.next}
                </button>
              ) : (
                <button
                  type="submit" className="auth-btn auth-btn-primary"
                  disabled={formData.code.trim().length !== 6 || isLoading}
                >
                  {isLoading ? <><span className="spinner" /> Vérification...</> : t.auth.verify}
                </button>
              )}
            </div>
          </form>

          <div className="auth-footer">
            {t.auth.noAccount} <Link to="/register">{t.auth.signUp}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
