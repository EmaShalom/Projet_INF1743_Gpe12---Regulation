import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { formatDateTime, formatRelativeDate } from '../utils/formatters'

import Card from '../components/Card'
import Button from '../components/Button'

import './NotificationsPage.css'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyValues, setReplyValues] = useState({})
  const [submittingId, setSubmittingId] = useState(null)

  const loadNotifications = async () => {
    setIsLoading(true)
    setError('')

    try {
      const res = await api.get('/notifications')
      setNotifications(res.data?.notifications || [])
    } catch (err) {
      console.error('Erreur chargement notifications:', err)
      setError("Impossible de charger les notifications.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleReplyChange = (commentId, value) => {
    setReplyValues((prev) => ({
      ...prev,
      [commentId]: value
    }))
  }

  const handleReplySubmit = async (commentId, requestId) => {
    const contenu = replyValues[commentId]?.trim()

    if (!contenu || contenu.length < 5) return

    setSubmittingId(commentId)

    try {
      await api.post(`/requests/${requestId}/comments`, {
        contenu
      })

      setReplyValues((prev) => ({
        ...prev,
        [commentId]: ''
      }))

      await loadNotifications()
    } catch (err) {
      console.error('Erreur réponse notification:', err)
      setError(err.response?.data?.error || "Impossible d'envoyer la réponse.")
    } finally {
      setSubmittingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Chargement des notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="page-header">
          <h1>🔔 Notifications</h1>
          <p>Consultez les commentaires laissés par les gestionnaires sur vos demandes.</p>
        </div>

        {error && (
          <div className="submit-error">❌ {error}</div>
        )}

        {notifications.length === 0 ? (
          <Card className="empty-card" title="Aucune notification">
            <p>Vous n’avez aucun commentaire de gestionnaire pour le moment.</p>
          </Card>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className="notification-card"
                title={`📩 ${notif.demande?.titre || 'Demande'}`}
              >
                <div className="notification-meta">
                  <p>
                    <strong>Gestionnaire :</strong> {notif.auteur?.nom_complet || 'Gestionnaire'}
                  </p>
                  <p>
                    <strong>Statut de la demande :</strong> {notif.demande?.statut || '—'}
                  </p>
                  <p>
                    <strong>Date :</strong> {formatRelativeDate(notif.date_creation)} • {formatDateTime(notif.date_creation)}
                  </p>
                </div>

                <div className="notification-comment">
                  {notif.contenu}
                </div>

                <div className="notification-actions">
                  <Link to={`/requests/${notif.demande?.id}`}>
                    <Button variant="secondary">
                      Ouvrir la demande
                    </Button>
                  </Link>
                </div>

                <div className="reply-box">
                  <label className="reply-label">Répondre</label>
                  <textarea
                    className="reply-textarea"
                    rows="3"
                    placeholder="Écrire une réponse..."
                    value={replyValues[notif.id] || ''}
                    onChange={(e) => handleReplyChange(notif.id, e.target.value)}
                  />

                  <div className="reply-footer">
                    <span className="reply-help">Minimum 5 caractères</span>
                    <Button
                      variant="primary"
                      loading={submittingId === notif.id}
                      disabled={(replyValues[notif.id] || '').trim().length < 5 || submittingId === notif.id}
                      onClick={() => handleReplySubmit(notif.id, notif.demande?.id)}
                    >
                      Répondre
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage