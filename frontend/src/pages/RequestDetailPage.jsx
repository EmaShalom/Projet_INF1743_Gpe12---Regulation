import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  getRequestById, 
  getCommentsByRequestId, 
  getStatusHistoryByRequestId,
  mockUsers 
} from '../mockData'
import { 
  STATUS_LABELS, 
  REQUEST_STATUS,
  ERROR_MESSAGES 
} from '../utils/constants'
import { formatDateTime, formatRelativeDate } from '../utils/formatters'
import './RequestDetailPage.css'

const RequestDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // ==================== ÉTAT ====================
  const [request, setRequest] = useState(null)
  const [comments, setComments] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isManager = currentUser.role === 'gestionnaire'
  
  // ==================== CHARGEMENT DES DONNÉES ====================
  useEffect(() => {
    const loadRequest = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // L1 : Simuler un délai
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Récupérer la demande
        const requestData = getRequestById(id)
        
        if (!requestData) {
          setError('Demande introuvable')
          return
        }
        
        // Vérifier les permissions
        const isOwner = requestData.createur_id === currentUser.id
        if (!isOwner && !isManager) {
          setError('Vous n\'avez pas accès à cette demande')
          setTimeout(() => navigate('/dashboard'), 2000)
          return
        }
        
        setRequest(requestData)
        
        // Charger les commentaires et l'historique
        const requestComments = getCommentsByRequestId(id)
        const history = getStatusHistoryByRequestId(id)
        
        setComments(requestComments)
        setStatusHistory(history)
        
        // TODO L2 : Appeler l'API
        // const response = await fetch(`/api/requests/${id}/`, {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // })
        // if (response.status === 403) {
        //   setError('Accès refusé')
        //   return
        // }
        // const data = await response.json()
        // setRequest(data)
        
      } catch (err) {
        console.error('Erreur chargement demande:', err)
        setError('Une erreur est survenue lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadRequest()
  }, [id, currentUser.id, isManager, navigate])
  
  // ==================== GESTIONNAIRES ====================
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    if (newComment.trim().length < 5) {
      alert('Le commentaire doit contenir au moins 5 caractères')
      return
    }
    
    setIsSubmittingComment(true)
    
    try {
      // L1 : Simuler l'ajout d'un commentaire
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const comment = {
        id: comments.length + 1,
        request_id: parseInt(id),
        auteur_id: currentUser.id,
        auteur_nom: currentUser.nom_complet,
        contenu: newComment,
        date_creation: new Date().toISOString()
      }
      
      setComments([...comments, comment])
      setNewComment('')
      
      // TODO L2 : Appeler l'API
      // const response = await fetch(`/api/requests/${id}/comments/`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ contenu: newComment })
      // })
      
    } catch (err) {
      console.error('Erreur ajout commentaire:', err)
      alert('Erreur lors de l\'ajout du commentaire')
    } finally {
      setIsSubmittingComment(false)
    }
  }
  
  const getCreatorName = (creatorId) => {
    const user = mockUsers.find(u => u.id === creatorId)
    return user ? user.nom_complet : 'Utilisateur inconnu'
  }
  
  const getStatusBadgeClass = (status) => {
    const classes = {
      [REQUEST_STATUS.SUBMITTED]: 'status-submitted',
      [REQUEST_STATUS.IN_PROGRESS]: 'status-in-progress',
      [REQUEST_STATUS.RESOLVED]: 'status-resolved',
      [REQUEST_STATUS.CLOSED]: 'status-closed'
    }
    return classes[status] || 'status-default'
  }
  
  const canEdit = () => {
    if (!request) return false
    const isOwner = request.createur_id === currentUser.id
    return isOwner && request.statut === REQUEST_STATUS.SUBMITTED
  }
  
  const canComment = () => {
    if (!request) return false
    if (request.statut === REQUEST_STATUS.CLOSED) return false
    
    const isOwner = request.createur_id === currentUser.id
    return isOwner || isManager
  }
  
  // ==================== RENDU ====================
  if (isLoading) {
    return (
      <div className="request-detail-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Chargement de la demande...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="request-detail-page">
        <div className="error-container">
          <p className="error-icon">⚠️</p>
          <h2>Erreur</h2>
          <p>{error}</p>
          <Link to="/dashboard" className="btn-back">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }
  
  if (!request) {
    return null
  }
  
  return (
    <div className="request-detail-page">
      <div className="request-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/dashboard">Tableau de bord</Link>
          <span className="separator">›</span>
          <span>Demande #{request.id}</span>
        </nav>
        
        {/* En-tête */}
        <div className="request-header">
          <div className="header-content">
            <h1>{request.titre}</h1>
            <div className="header-meta">
              <span className={`status-badge ${getStatusBadgeClass(request.statut)}`}>
                {STATUS_LABELS[request.statut]}
              </span>
              <span className="type-badge">{request.type}</span>
            </div>
          </div>
          
          {canEdit() && (
            <button 
              className="btn-edit"
              onClick={() => navigate(`/requests/${id}/edit`)}
            >
              ✏️ Modifier
            </button>
          )}
        </div>
        
        {/* Informations principales */}
        <div className="request-info-card">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Créé par</span>
              <span className="info-value">{getCreatorName(request.createur_id)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date de création</span>
              <span className="info-value">{formatDateTime(request.date_creation)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dernière modification</span>
              <span className="info-value">{formatDateTime(request.date_modification)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Statut actuel</span>
              <span className={`info-value status-${request.statut.toLowerCase()}`}>
                {STATUS_LABELS[request.statut]}
              </span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="section-card">
          <h2>Description</h2>
          <p className="description-text">{request.description}</p>
        </div>
        
        {/* Historique des statuts */}
        {statusHistory.length > 0 && (
          <div className="section-card">
            <h2>Historique des changements</h2>
            <div className="history-list">
              {statusHistory.map(entry => (
                <div key={entry.id} className="history-item">
                  <div className="history-icon">📅</div>
                  <div className="history-content">
                    <p className="history-text">
                      <strong>{entry.modifie_par_nom}</strong> a changé le statut de{' '}
                      <span className={`status-inline status-${entry.ancien_statut.toLowerCase()}`}>
                        {STATUS_LABELS[entry.ancien_statut]}
                      </span>
                      {' '}à{' '}
                      <span className={`status-inline status-${entry.nouveau_statut.toLowerCase()}`}>
                        {STATUS_LABELS[entry.nouveau_statut]}
                      </span>
                    </p>
                    <p className="history-date">
                      {formatRelativeDate(entry.date_modification)} • {formatDateTime(entry.date_modification)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Commentaires */}
        <div className="section-card">
          <h2>Commentaires ({comments.length})</h2>
          
          {/* Liste des commentaires */}
          {comments.length > 0 ? (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.auteur_nom.charAt(0)}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>{comment.auteur_nom}</strong>
                      <span className="comment-date">
                        {formatRelativeDate(comment.date_creation)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.contenu}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments">Aucun commentaire pour le moment.</p>
          )}
          
          {/* Formulaire d'ajout de commentaire */}
          {canComment() && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="comment-textarea"
                rows="3"
                disabled={isSubmittingComment}
              />
              <div className="comment-form-footer">
                <span className="comment-help">
                  Minimum 5 caractères
                </span>
                <button 
                  type="submit"
                  className="btn-submit-comment"
                  disabled={newComment.trim().length < 5 || isSubmittingComment}
                >
                  {isSubmittingComment ? (
                    <>
                      <span className="spinner-small"></span>
                      Envoi...
                    </>
                  ) : (
                    'Ajouter un commentaire'
                  )}
                </button>
              </div>
            </form>
          )}
          
          {request.statut === REQUEST_STATUS.CLOSED && (
            <p className="closed-message">
              ℹ️ Cette demande est fermée. Vous ne pouvez plus ajouter de commentaires.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestDetailPage