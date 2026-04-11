import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { validateEmail } from '../utils/validators'
import { useLang } from '../context/LanguageContext'
import api from '../services/api'
import './LoginPage.css'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const { t } = useLang()
  const f = t.form
  const a = t.auth

  const [step, setStep] = useState(1) // 1=email 2=code 3=new password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showPwdConfirm, setShowPwdConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!validateEmail(email)) { setErrors({ email: "Format d'email invalide" }); return }
    setIsLoading(true); setErrors({})
    try {
      const res = await api.post('/auth/forgot-password/', { email })
      setSuccessMsg(res.data?.message || '')
      setStep(2)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || t.common.error })
    } finally { setIsLoading(false) }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (code.trim().length !== 6) { setErrors({ code: '6 chiffres requis' }); return }
    setIsLoading(true); setErrors({})
    try {
      await api.post('/auth/verify-reset-code/', { email, code })
      setStep(3)
    } catch (err) {
      setErrors({ code: err.response?.data?.error || 'Code invalide ou expiré' })
    } finally { setIsLoading(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) { setErrors({ password: a.passwordHint }); return }
    if (password !== passwordConfirm) { setErrors({ passwordConfirm: 'Les mots de passe ne correspondent pas' }); return }
    setIsLoading(true); setErrors({})
    try {
      await api.post('/auth/reset-password/', { email, code, password })
      navigate('/login', { state: { message: 'Mot de passe réinitialisé avec succès ! Connectez-vous.' } })
    } catch (err) {
      const msg = err.response?.data?.error || t.common.error
      setErrors({ submit: msg })
      if (msg.includes('expiré') || msg.includes('invalide') || msg.includes('expired') || msg.includes('invalid')) {
        setStep(2)
      }
    } finally { setIsLoading(false) }
  }

  const steps = [f.stepEmail, f.stepCode, f.stepNewPwd]

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <span style={{ fontSize: '24px' }}>🔑</span>
          <span className="auth-left-logo-name">{t.appName}</span>
        </div>
        <div className="auth-left-body">
          <div>
            <div className="auth-left-title">{f.leftForgotTitle}</div>
            <div className="auth-left-sub">{f.leftForgotSubtitle}</div>
          </div>
          <div className="auth-left-points">
            {[f.leftForgotPoint1, f.leftForgotPoint2, f.leftForgotPoint3].map((pt, i) => (
              <div className="auth-point" key={i}>
                <div className="auth-point-icon">✓</div>
                <span className="auth-point-text">{pt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-left-footer">© 2026 Université du Québec en Outaouais</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h1 className="auth-form-title">{f.forgotTitle}</h1>
            <p className="auth-form-subtitle">{f.forgotSubtitle}</p>
          </div>

          {/* Step indicators */}
          <div className="auth-steps">
            {steps.map((label, i) => {
              const n = i + 1
              return (
                <React.Fragment key={n}>
                  <div className={`auth-step${step === n ? ' active' : ''}${step > n ? ' done' : ''}`}>
                    <div className="auth-step-dot">{step > n ? '✓' : n}</div>
                    <span>{label}</span>
                  </div>
                  {i < steps.length - 1 && <div className="auth-step-sep" />}
                </React.Fragment>
              )
            })}
          </div>

          {successMsg && step === 2 && (
            <div className="auth-alert-success">✅ {successMsg}</div>
          )}

          {/* STEP 1: Email */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">{a.emailLabel}</label>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    className={`auth-input${errors.email ? ' has-error' : ''}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors({}) }}
                    placeholder={a.emailPlaceholder}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>

              {errors.submit && <div className="auth-alert-error">⚠ {errors.submit}</div>}

              <div className="auth-actions">
                <button type="button" className="auth-btn auth-btn-secondary" onClick={() => navigate('/login')} disabled={isLoading}>
                  {a.back}
                </button>
                <button type="submit" className="auth-btn auth-btn-primary" disabled={!validateEmail(email) || isLoading}>
                  {isLoading ? <span className="spinner" /> : null}
                  {f.sendCode}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Verification code */}
          {step === 2 && (
            <form onSubmit={handleCodeSubmit} className="auth-form">
              <div className="auth-code-info">
                📧 {f.codeInfo} <strong>{email}</strong>. {f.codeValid}
              </div>
              <div className="auth-field">
                <label className="auth-label">{a.codeLabel}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`auth-input${errors.code ? ' has-error' : ''}`}
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors({}) }}
                  placeholder={a.codePlaceholder}
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  style={{ letterSpacing: '0.2em', fontSize: 'var(--text-lg)', textAlign: 'center' }}
                />
                {errors.code && <span className="auth-field-error">{errors.code}</span>}
              </div>

              {errors.submit && <div className="auth-alert-error">⚠ {errors.submit}</div>}

              <div className="auth-actions">
                <button type="button" className="auth-btn auth-btn-secondary" onClick={() => setStep(1)} disabled={isLoading}>
                  {a.back}
                </button>
                <button type="submit" className="auth-btn auth-btn-primary" disabled={code.trim().length !== 6 || isLoading}>
                  {isLoading ? <span className="spinner" /> : null}
                  {f.verifyCode}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: New password */}
          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">{f.newPasswordLabel}</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`auth-input${errors.password ? ' has-error' : ''}`}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors({}) }}
                    placeholder={a.passwordPlaceholder}
                    autoComplete="new-password"
                    style={{ paddingRight: '70px' }}
                  />
                  <button type="button" className="auth-input-suffix" onClick={() => setShowPwd(s => !s)}>
                    {showPwd ? a.hide : a.show}
                  </button>
                </div>
                <span className="auth-field-hint">{a.passwordHint}</span>
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label">{f.confirmPasswordLabel}</label>
                <div className="auth-input-wrap">
                  <input
                    type={showPwdConfirm ? 'text' : 'password'}
                    className={`auth-input${errors.passwordConfirm ? ' has-error' : ''}`}
                    value={passwordConfirm}
                    onChange={e => { setPasswordConfirm(e.target.value); setErrors({}) }}
                    placeholder={a.passwordPlaceholder}
                    autoComplete="new-password"
                    style={{ paddingRight: '70px' }}
                  />
                  <button type="button" className="auth-input-suffix" onClick={() => setShowPwdConfirm(s => !s)}>
                    {showPwdConfirm ? a.hide : a.show}
                  </button>
                </div>
                {errors.passwordConfirm && <span className="auth-field-error">{errors.passwordConfirm}</span>}
              </div>

              {errors.submit && <div className="auth-alert-error">⚠ {errors.submit}</div>}

              <div className="auth-actions">
                <button type="button" className="auth-btn auth-btn-secondary" onClick={() => setStep(2)} disabled={isLoading}>
                  {a.back}
                </button>
                <button
                  type="submit"
                  className="auth-btn auth-btn-primary"
                  disabled={password.length < 8 || password !== passwordConfirm || isLoading}
                >
                  {isLoading ? <span className="spinner" /> : null}
                  {f.resetPassword}
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            {a.hasAccount} <Link to="/login">{a.signIn}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
