import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { REQUEST_TYPES, CHAR_LIMITS } from '../utils/constants'
import { validateTitle, validateDescription } from '../utils/validators'
import './CreateRequestPage.css'

const CreateRequestPage = () => {
  const navigate = useNavigate()
  
  // ==================== ÉTAT ====================
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  
  // ==================== VALIDATION ====================
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
        }
      }
    }
    
    if (name === 'type') {
      if (!value) {
        error = 'Le type est requis'
      }
    }
    
    setErrors(prev => ({ ...prev, [name]: error }))
  }
  
  // ==================== GESTIONNAIRES ====================
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation finale
    if (!isFormValid()) return
    
    setIsSubmitting(true)
    
    try {
      // L1 : Simuler la création d'une demande
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newRequest = {
        id: Date.now(),
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        statut: 'SUBMITTED',
        createur_id: currentUser.id,
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString()
      }
      
      console.log('Demande créée (simulée):', newRequest)
      
      // TODO L2 : Appeler l'API
      // const response = await fetch('/api/requests/', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     titre: formData.titre,
      //     description: formData.description,
      //     type: formData.type
      //   })
      // })
      //
      // const data = await response.json()
      // navigate(`/requests/${data.id}`)
      
      // L1 : Rediriger vers dashboard
      navigate('/dashboard', {
        state: {
          message: 'Votre demande a été créée avec succès !'
        }
      })
      
    } catch (error) {
      console.error('Erreur création demande:', error)
      setErrors({
        submit: 'Une erreur est survenue lors de la création de la demande'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const isFormValid = () => {
    return (
      validateTitle(formData.titre) &&
      validateDescription(formData.description) &&
      formData.type &&
      Object.values(errors).every(error => !error)
    )
  }
  
  // ==================== RENDU ====================
  return (
    <div className="create-request-page">
      <div className="create-request-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/dashboard">Tableau de bord</Link>
          <span className="separator">›</span>
          <span>Nouvelle demande</span>
        </nav>
        
        {/* En-tête */}
        <div className="page-header">
          <h1>Créer une nouvelle demande</h1>
          <p>Remplissez le formulaire ci-dessous pour soumettre votre demande</p>
        </div>
        
        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="create-request-form">
          {/* Titre */}
          <div className="form-group">
            <label htmlFor="titre">
              Titre de la demande <span className="required">*</span>
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              className={errors.titre ? 'input-error' : ''}
              placeholder="Ex: Problème de connexion au VPN"
              maxLength={CHAR_LIMITS.TITLE_MAX}
            />
            <div className="field-footer">
              <span className={`char-count ${formData.titre.length > CHAR_LIMITS.TITLE_MAX ? 'over-limit' : ''}`}>
                {formData.titre.length} / {CHAR_LIMITS.TITLE_MAX} caractères
              </span>
              {errors.titre && (
                <span className="error-message">
                  ⚠️ {errors.titre}
                </span>
              )}
            </div>
          </div>
          
          {/* Type */}
          <div className="form-group">
            <label htmlFor="type">
              Type de demande <span className="required">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? 'input-error' : ''}
            >
              <option value="">-- Sélectionnez un type --</option>
              {Object.entries(REQUEST_TYPES).map(([key, label]) => (
                <option key={key} value={label}>
                  {label}
                </option>
              ))}
            </select>
            {errors.type && (
              <span className="error-message">
                ⚠️ {errors.type}
              </span>
            )}
          </div>
          
          {/* Description */}
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
              <span className={`char-count ${formData.description.length > CHAR_LIMITS.DESCRIPTION_MAX ? 'over-limit' : ''}`}>
                {formData.description.length} / {CHAR_LIMITS.DESCRIPTION_MAX} caractères
              </span>
              {errors.description && (
                <span className="error-message">
                  ⚠️ {errors.description}
                </span>
              )}
            </div>
          </div>
          
          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="submit-error">
              ❌ {errors.submit}
            </div>
          )}
          
          {/* Boutons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Création en cours...
                </>
              ) : (
                'Créer la demande'
              )}
            </button>
          </div>
        </form>
        
        {/* Aide */}
        <div className="help-card">
          <h3>💡 Conseils pour une bonne demande</h3>
          <ul>
            <li>Choisissez un titre clair et descriptif</li>
            <li>Sélectionnez le type de demande approprié</li>
            <li>Décrivez le problème en détail avec les étapes pour le reproduire</li>
            <li>Mentionnez le navigateur/système utilisé si pertinent</li>
            <li>Ajoutez des captures d'écran si nécessaire (commentaires après création)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CreateRequestPage