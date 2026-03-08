import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import api from '../services/api'
import {
  STATUS_LABELS,
  REQUEST_STATUS
} from '../utils/constants'
import { formatDateTime, formatRelativeDate } from '../utils/formatters'

import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

import './RequestDetailPage.css'

const RequestDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const successMessage = location.state?.message

  const [request, setRequest] = useState(null)
  const [comments, setComments] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isManager = currentUser.role === 'gestionnaire'

  const getCreatorName = (req) => {
    return req?.createur?.nom_complet || 'Utilisateur inconnu'
  }

  const getCommentAuthorName = (comment) => {
    return comment?.auteur?.nom_complet || 'Utilisateur inconnu'
  }

  const getHistoryAuthorName = (entry) => {
    return entry?.modifie_par?.nom_complet || 'Utilisateur inconnu'
  }

  const statusToBadgeClass = (status) => {
    const map = {
      [REQUEST_STATUS.SUBMITTED]: 'submitted',
      [REQUEST_STATUS.IN_PROGRESS]: 'in-progress',
      [REQUEST_STATUS.RESOLVED]: 'resolved',
      [REQUEST_STATUS.CLOSED]: 'closed'
    }
    return map[status] || 'submitted'
  }

  const canEdit = useMemo(() => {
    if (!request) return false
    const isOwner = request.createur_id === currentUser.id
    return isOwner && request.statut === REQUEST_STATUS.SUBMITTED
  }, [request, currentUser.id])

  const canComment = useMemo(() => {
    if (!request) return false
    if (request.statut === REQUEST_STATUS.CLOSED) return false
    const isOwner = request.createur_id === currentUser.id
    return isOwner || isManager
  }, [request, currentUser.id, isManager])

  const loadRequest = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await api.get(`/requests/${id}`)
      const requestData = res.data?.request

      if (!requestData) {
        setError('Demande introuvable')
        return
      }

      setRequest(requestData)
      setComments(requestData.commentaires || [])
      setStatusHistory(requestData.historique || [])
    } catch (err) {
      console.error('Erreur chargement demande:', err)

      if (err.response?.status === 403) {
        setError("Vous n'avez pas accès à cette demande")
        setTimeout(() => navigate('/dashboard'), 2000)
      } else if (err.response?.status === 404) {
        setError('Demande introuvable')
      } else {
        setError('Une erreur est survenue lors du chargement')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRequest()
  }, [id])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (newComment.trim().length < 5) return

    setIsSubmittingComment(true)

    try {
      const res = await api.post(`/requests/${id}/comments`, {
        contenu: newComment
      })

      const createdComment = res.data?.comment

      if (createdComment) {
        setComments((prev) => [...prev, createdComment])
      }

      setNewComment('')
    } catch (err) {
      console.error('Erreur ajout commentaire:', err)
      setError(err.response?.data?.error || "Erreur lors de l'ajout du commentaire")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setError(null)
      setStatusMessage('')

      const res = await api.patch(`/requests/${id}/status`, {
        statut: newStatus,
        commentaire: `Statut changé vers ${newStatus}`
      })

      setStatusMessage(res.data?.message || 'Statut mis à jour avec succès.')
      await loadRequest()
    } catch (err) {
      console.error('Erreur changement statut:', err)
      setError(err.response?.data?.error || 'Impossible de modifier le statut.')
    }
  }

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

          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="request-detail-page">
      <div className="request-detail-container">
        <nav className="breadcrumb">
          <Link to="/dashboard">Tableau de bord</Link>
          <span className="separator">›</span>
          <span>Demande #{request.id}</span>
        </nav>

        {successMessage && (
          <div className="success-message">✅ {successMessage}</div>
        )}

        {statusMessage && (
          <div className="success-message">✅ {statusMessage}</div>
        )}

        <div className="request-header">
          <div className="header-content">
            <h1>{request.titre}</h1>

            <div className="header-meta">
              <Badge status={statusToBadgeClass(request.statut)}>
                {STATUS_LABELS[request.statut] || request.statut}
              </Badge>

              <span className="type-badge">{request.type}</span>
            </div>
          </div>

          {canEdit && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/requests/${id}/edit`)}
            >
              ✏️ Modifier
            </Button>
          )}
        </div>

        <Card className="request-info-card" title="📌 Informations">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Créé par</span>
              <span className="info-value">{getCreatorName(request)}</span>
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
              <span className="info-value">
                <Badge status={statusToBadgeClass(request.statut)}>
                  {STATUS_LABELS[request.statut] || request.statut}
                </Badge>
              </span>
            </div>
          </div>
        </Card>

        {isManager && (
          <Card className="section-card" title="🛠 Gestion du statut">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={request.statut === 'IN_PROGRESS'}
              >
                Mettre en cours
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleStatusChange('RESOLVED')}
                disabled={request.statut === 'RESOLVED'}
              >
                Marquer résolu
              </Button>

              <Button
                variant="danger"
                onClick={() => handleStatusChange('CLOSED')}
                disabled={request.statut === 'CLOSED'}
              >
                Fermer la demande
              </Button>
            </div>
          </Card>
        )}

        <Card className="section-card" title="📝 Description">
          <p className="description-text">{request.description}</p>
        </Card>

        {statusHistory.length > 0 && (
          <Card className="section-card" title="🕘 Historique des changements">
            <div className="history-list">
              {statusHistory.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-icon">📅</div>
                  <div className="history-content">
                    <p className="history-text">
                      <strong>{getHistoryAuthorName(entry)}</strong> a changé le statut de{' '}
                      <Badge status={statusToBadgeClass(entry.ancien_statut)}>
                        {entry.ancien_statut ? (STATUS_LABELS[entry.ancien_statut] || entry.ancien_statut) : '—'}
                      </Badge>{' '}
                      à{' '}
                      <Badge status={statusToBadgeClass(entry.nouveau_statut)}>
                        {STATUS_LABELS[entry.nouveau_statut] || entry.nouveau_statut}
                      </Badge>
                    </p>
                    <p className="history-date">
                      {formatRelativeDate(entry.date_modification)} • {formatDateTime(entry.date_modification)}
                    </p>
                    {entry.commentaire && (
                      <p className="history-comment">{entry.commentaire}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="section-card" title={`💬 Commentaires (${comments.length})`}>
          {comments.length > 0 ? (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {getCommentAuthorName(comment).charAt(0)}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <strong>{getCommentAuthorName(comment)}</strong>
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

          {canComment && (
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
                <span className="comment-help">Minimum 5 caractères</span>

                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmittingComment}
                  disabled={newComment.trim().length < 5 || isSubmittingComment}
                >
                  Ajouter un commentaire
                </Button>
              </div>
            </form>
          )}

          {request.statut === REQUEST_STATUS.CLOSED && (
            <p className="closed-message">
              ℹ️ Cette demande est fermée. Vous ne pouvez plus ajouter de commentaires.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default RequestDetailPage