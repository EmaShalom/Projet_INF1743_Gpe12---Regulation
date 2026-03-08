import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { REQUEST_TYPES, CHAR_LIMITS, REQUEST_STATUS } from '../utils/constants'
import { validateTitle, validateDescription } from '../utils/validators'
import api from '../services/api'

import Card from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'

import './CreateRequestPage.css'

const EditRequestPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: ''
  })

  const [request, setRequest] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const validateField = (name, value) => {
    let error = ''

    if (name === 'titre') {
      if (!value.trim()) {
        error = 'Le titre est requis'
      } else if (!validateTitle(value)) {
        if (value.trim().length < CHAR_LIMITS.TITLE_MIN) {
          error = `Le titre doit contenir au moins ${CHAR_LIMITS.TITLE_MIN} caractères`
        } else if (value.trim().length > CHAR_LIMITS.TITLE_MAX) {
          error = `Le titre ne peut pas dépasser ${CHAR_LIMITS.TITLE_MAX} caractères`
        } else {
          error = 'Titre invalide'
        }
      }
    }

    if (name === 'description') {
      if (!value.trim()) {
        error = 'La description est requise'
      } else if (!validateDescription(value)) {
        if (value.trim().length < CHAR_LIMITS.DESCRIPTION_MIN) {
          error = `La description doit contenir au moins ${CHAR_LIMITS.DESCRIPTION_MIN} caractères`
        } else if (value.trim().length > CHAR_LIMITS.DESCRIPTION_MAX) {
          error = `La description ne peut pas dépasser ${CHAR_LIMITS.DESCRIPTION_MAX} caractères`
        } else {
          error = 'Description invalide'
        }
      }
    }

    if (name === 'type') {
      if (!value) error = 'Le type est requis'
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)

    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }))
    }
  }

  const isFormValid = () => {
    return (
      validateTitle(formData.titre) &&
      validateDescription(formData.description) &&
      !!formData.type &&
      !errors.titre &&
      !errors.description &&
      !errors.type
    )
  }

  useEffect(() => {
    const loadRequest = async () => {
      setIsLoading(true)
      setErrors({})

      try {
        const res = await api.get(`/requests/${id}`)
        const requestData = res.data?.request

        if (!requestData) {
          setErrors({ submit: 'Demande introuvable.' })
          return
        }

        const isOwner = requestData.createur_id === currentUser.id
        const canEdit = isOwner && requestData.statut === REQUEST_STATUS.SUBMITTED

        if (!canEdit) {
          setErrors({
            submit: 'Modification impossible. Seules vos demandes au statut SUBMITTED peuvent être modifiées.'
          })
          return
        }

        setRequest(requestData)
        setFormData({
          titre: requestData.titre || '',
          description: requestData.description || '',
          type: requestData.type || ''
        })
      } catch (error) {
        console.error('Erreur chargement demande:', error)

        if (error.response?.status === 403) {
          setErrors({ submit: "Vous n'avez pas accès à cette demande." })
        } else if (error.response?.status === 404) {
          setErrors({ submit: 'Demande introuvable.' })
        } else {
          setErrors({ submit: 'Une erreur est survenue lors du chargement.' })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadRequest()
  }, [id, currentUser.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid()) return

    setIsSubmitting(true)
    setErrors((prev) => ({ ...prev, submit: '' }))

    try {
      await api.put(`/requests/${id}`, {
        titre: formData.titre,
        description: formData.description,
        type: formData.type
      })

      navigate(`/requests/${id}`, {
        state: { message: 'La demande a été modifiée avec succès.' }
      })
    } catch (error) {
      console.error('Erreur modification demande:', error)

      const data = error.response?.data

      if (error.response?.status === 400 && data?.erreurs) {
        setErrors((prev) => ({
          ...prev,
          titre: data.erreurs.titre?.[0] || '',
          description: data.erreurs.description?.[0] || '',
          type: data.erreurs.type?.[0] || '',
          submit: ''
        }))
      } else if (error.response?.status === 403) {
        setErrors((prev) => ({
          ...prev,
          submit: data?.error || 'Modification non autorisée.'
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: data?.error || 'Une erreur est survenue lors de la modification.'
        }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = [
    { value: '', label: '-- Sélectionnez un type --' },
    ...Object.entries(REQUEST_TYPES).map(([, label]) => ({
      value: label,
      label
    }))
  ]

  if (isLoading) {
    return (
      <div className="create-request-page">
        <div className="create-request-container">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Chargement de la demande...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-request-page">
      <div className="create-request-container">
        <nav className="breadcrumb">
          <Link to="/dashboard">Tableau de bord</Link>
          <span className="separator">›</span>
          <Link to={`/requests/${id}`}>Demande #{id}</Link>
          <span className="separator">›</span>
          <span>Modifier</span>
        </nav>

        <div className="page-header">
          <h1>Modifier la demande</h1>
          <p>Mettez à jour les informations de votre demande</p>
        </div>

        <Card className="create-request-card" title="✏️ Modifier la demande">
          <form onSubmit={handleSubmit} className="create-request-form">
            <div className="form-group">
              <Input
                label="Titre de la demande"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Problème de connexion au VPN"
                error={errors.titre}
                required
                maxLength={CHAR_LIMITS.TITLE_MAX}
              />

              <div className="field-footer">
                <span className="char-count">
                  {formData.titre.length} / {CHAR_LIMITS.TITLE_MAX} caractères
                </span>
              </div>
            </div>

            <div className="form-group">
              <Select
                label="Type de demande"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={typeOptions}
                error={errors.type}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description détaillée <span className="required">*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? 'input-error' : ''}
                placeholder="Décrivez votre demande en détail..."
                rows="8"
                maxLength={CHAR_LIMITS.DESCRIPTION_MAX}
              />

              <div className="field-footer">
                <span className="char-count">
                  {formData.description.length} / {CHAR_LIMITS.DESCRIPTION_MAX} caractères
                </span>

                {errors.description && (
                  <span className="error-message">⚠️ {errors.description}</span>
                )}
              </div>
            </div>

            {errors.submit && <div className="submit-error">❌ {errors.submit}</div>}

            <div className="form-actions">
              <Button
                variant="secondary"
                type="button"
                disabled={isSubmitting}
                onClick={() => navigate(`/requests/${id}`)}
              >
                Annuler
              </Button>

              <Button
                variant="primary"
                type="submit"
                loading={isSubmitting}
                disabled={!isFormValid() || isSubmitting || !request}
              >
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default EditRequestPage