import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { REQUEST_TYPES, CHAR_LIMITS } from '../utils/constants'
import { validateTitle, validateDescription } from '../utils/validators'
import api from '../services/api'

import Card from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'

import './CreateRequestPage.css'

const CreateRequestPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      Object.values(errors).every((err) => !err)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid()) return

    setIsSubmitting(true)
    setErrors((prev) => ({ ...prev, submit: '' }))

    try {
      await api.post('/requests/', {
        titre: formData.titre,
        description: formData.description,
        type: formData.type
      })

      navigate('/dashboard', {
        state: { message: 'Votre demande a été créée avec succès !' }
      })
    } catch (error) {
      console.error('Erreur création demande:', error)

      const data = error.response?.data

      if (error.response?.status === 400 && data?.erreurs) {
        setErrors((prev) => ({
          ...prev,
          titre: data.erreurs.titre?.[0] || prev.titre || '',
          description: data.erreurs.description?.[0] || prev.description || '',
          type: data.erreurs.type?.[0] || prev.type || '',
          submit: ''
        }))
      } else if (error.response?.status === 401) {
        setErrors((prev) => ({
          ...prev,
          submit: 'Votre session a expiré. Veuillez vous reconnecter.'
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: data?.error || 'Une erreur est survenue lors de la création de la demande'
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

  return (
    <div className="create-request-page">
      <div className="create-request-container">
        <nav className="breadcrumb">
          <Link to="/dashboard">Tableau de bord</Link>
          <span className="separator">›</span>
          <span>Nouvelle demande</span>
        </nav>

        <div className="page-header">
          <h1>Créer une nouvelle demande</h1>
          <p>Remplissez le formulaire ci-dessous pour soumettre votre demande</p>
        </div>

        <Card className="create-request-card" title="📝 Formulaire de demande">
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
                onClick={() => navigate('/dashboard')}
              >
                Annuler
              </Button>

              <Button
                variant="primary"
                type="submit"
                loading={isSubmitting}
                disabled={!isFormValid() || isSubmitting}
              >
                Créer la demande
              </Button>
            </div>
          </form>
        </Card>

        <Card className="help-card" title="💡 Conseils pour une bonne demande">
          <ul>
            <li>Choisissez un titre clair et descriptif</li>
            <li>Sélectionnez le type de demande approprié</li>
            <li>Décrivez le problème en détail avec les étapes pour le reproduire</li>
            <li>Mentionnez le navigateur/système utilisé si pertinent</li>
            <li>Ajoutez des captures d'écran si nécessaire (commentaires après création)</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default CreateRequestPage