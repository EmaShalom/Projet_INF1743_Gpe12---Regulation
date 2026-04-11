import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { REQUEST_TYPES, CHAR_LIMITS, REQUEST_STATUS } from '../utils/constants'
import { validateTitle, validateDescription } from '../utils/validators'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import { requestService } from '../services/requestService'
import './CreateRequestPage.css'

const EditRequestPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useLang()
  const f = t.form

  const [formData, setFormData] = useState({ titre: '', description: '', type: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [request, setRequest] = useState(null)

  const validateField = (name, value) => {
    let error = ''
    if (name === 'titre') {
      if (!value.trim()) error = `${f.titleLabel} ${f.required}`
      else if (value.trim().length < CHAR_LIMITS.TITLE_MIN) error = `Min. ${CHAR_LIMITS.TITLE_MIN} ${f.chars}`
      else if (value.trim().length > CHAR_LIMITS.TITLE_MAX) error = `Max. ${CHAR_LIMITS.TITLE_MAX} ${f.chars}`
      else if (!validateTitle(value)) error = `${f.titleLabel} invalide`
    }
    if (name === 'description') {
      if (!value.trim()) error = `${f.descriptionLabel} ${f.required}`
      else if (value.trim().length < CHAR_LIMITS.DESCRIPTION_MIN) error = `Min. ${CHAR_LIMITS.DESCRIPTION_MIN} ${f.chars}`
      else if (value.trim().length > CHAR_LIMITS.DESCRIPTION_MAX) error = `Max. ${CHAR_LIMITS.DESCRIPTION_MAX} ${f.chars}`
      else if (!validateDescription(value)) error = `${f.descriptionLabel} invalide`
    }
    if (name === 'type' && !value) error = `${f.typeLabel} ${f.required}`
    setErrors(p => ({ ...p, [name]: error }))
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    validateField(name, value)
    if (errors.submit) setErrors(p => ({ ...p, submit: '' }))
  }

  const isFormValid = () =>
    validateTitle(formData.titre) &&
    validateDescription(formData.description) &&
    !!formData.type &&
    !errors.titre && !errors.description && !errors.type

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setErrors({})
      try {
        const data = await requestService.obtenir(id)
        if (!data) { setErrors({ page: t.request.notFound }); return }
        const canEdit = data.createur_id === user?.id && data.statut === REQUEST_STATUS.SUBMITTED
        if (!canEdit) { setErrors({ page: f.notEditable }); return }

        setRequest(data)
        setFormData({ titre: data.titre || '', description: data.description || '', type: data.type || '' })
      } catch (err) {
        if (err.response?.status === 403) setErrors({ page: t.request.noAccess })
        else if (err.response?.status === 404) setErrors({ page: t.request.notFound })
        else setErrors({ page: t.common.error })
      } finally { setIsLoading(false) }
    }
    load()
  }, [id, user?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid()) return
    setIsSubmitting(true); setErrors(p => ({ ...p, submit: '' }))
    try {
      await requestService.modifier(id, {
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
      })
      navigate(`/requests/${id}`, { state: { message: 'La demande a été modifiée avec succès.' } })
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 400 && data?.erreurs) {
        setErrors(p => ({
          ...p,
          titre: data.erreurs.titre?.[0] || '',
          description: data.erreurs.description?.[0] || '',
          type: data.erreurs.type?.[0] || '',
        }))
      } else {
        setErrors(p => ({ ...p, submit: data?.error || t.common.error }))
      }
    } finally { setIsSubmitting(false) }
  }

  const typeOptions = Object.entries(REQUEST_TYPES).map(([, label]) => ({ value: label, label }))

  if (isLoading) {
    return (
      <div className="req-form-loading">
        <div className="spinner spinner-green spinner-large" />
        <span>{f.loadingRequest}</span>
      </div>
    )
  }

  if (errors.page) {
    return (
      <div className="req-form-error-state">
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2>{t.common.error}</h2>
        <p>{errors.page}</p>
        <button className="req-form-back-btn" onClick={() => navigate('/dashboard')}>
          ← {t.request.backToDashboard}
        </button>
      </div>
    )
  }

  return (
    <div className="req-form-page">
      {/* Breadcrumb */}
      <nav className="req-form-breadcrumb">
        <Link to="/dashboard">{t.request.backToDashboard}</Link>
        <span className="req-form-breadcrumb-sep">›</span>
        <Link to={`/requests/${id}`}>{t.request.request} #{id}</Link>
        <span className="req-form-breadcrumb-sep">›</span>
        <span>{t.common.edit}</span>
      </nav>

      <div className="req-form-layout">
        {/* Main form card */}
        <div className="req-form-main">
          <div className="req-form-card">
            <div className="req-form-card-header">
              <span className="req-form-card-title">✏️ {f.editTitle}</span>
              <p className="req-form-card-subtitle">{f.editSubtitle}</p>
            </div>
            <div className="req-form-card-body">
              <form onSubmit={handleSubmit}>

                {/* Title */}
                <div className="req-field">
                  <label className="req-label" htmlFor="titre">
                    {f.titleLabel} <span className="req-required">*</span>
                  </label>
                  <input
                    id="titre"
                    name="titre"
                    type="text"
                    className={`req-input${errors.titre ? ' req-input-error' : ''}`}
                    value={formData.titre}
                    onChange={handleChange}
                    placeholder={f.titlePlaceholder}
                    maxLength={CHAR_LIMITS.TITLE_MAX}
                  />
                  <div className="req-field-footer">
                    {errors.titre
                      ? <span className="req-error-msg">⚠ {errors.titre}</span>
                      : <span />
                    }
                    <span className="req-char-count">{formData.titre.length} / {CHAR_LIMITS.TITLE_MAX}</span>
                  </div>
                </div>

                {/* Type */}
                <div className="req-field">
                  <label className="req-label" htmlFor="type">
                    {f.typeLabel} <span className="req-required">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    className={`req-select${errors.type ? ' req-input-error' : ''}`}
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">{f.typeDefault}</option>
                    {typeOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {errors.type && <span className="req-error-msg">⚠ {errors.type}</span>}
                </div>

                {/* Description */}
                <div className="req-field">
                  <label className="req-label" htmlFor="description">
                    {f.descriptionLabel} <span className="req-required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`req-textarea${errors.description ? ' req-input-error' : ''}`}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={f.descriptionPlaceholder}
                    rows="7"
                    maxLength={CHAR_LIMITS.DESCRIPTION_MAX}
                  />
                  <div className="req-field-footer">
                    {errors.description
                      ? <span className="req-error-msg">⚠ {errors.description}</span>
                      : <span />
                    }
                    <span className="req-char-count">{formData.description.length} / {CHAR_LIMITS.DESCRIPTION_MAX}</span>
                  </div>
                </div>

                {errors.submit && (
                  <div className="req-form-error">⚠ {errors.submit}</div>
                )}

                <div className="req-form-actions">
                  <button
                    type="button"
                    className="req-btn-cancel"
                    disabled={isSubmitting}
                    onClick={() => navigate(`/requests/${id}`)}
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="req-btn-submit"
                    disabled={!isFormValid() || isSubmitting || !request}
                  >
                    {isSubmitting ? <span className="spinner" /> : null}
                    {f.submitEdit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Tips sidebar */}
        <aside className="req-form-aside">
          <div className="req-form-tips">
            <div className="req-form-tips-header">💡 {f.tipsTitle}</div>
            <ul className="req-form-tips-list">
              <li>{f.tip1}</li>
              <li>{f.tip2}</li>
              <li>{f.tip3}</li>
              <li>{f.tip4}</li>
              <li>{f.tip5}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default EditRequestPage
