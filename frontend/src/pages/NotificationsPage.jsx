import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { notificationService } from '../services/notificationService'
import { requestService } from '../services/requestService'
import { formatDateTime, formatRelativeDate } from '../utils/formatters'
import { useLang } from '../context/LanguageContext'
import './NotificationsPage.css'

const NotificationsPage = () => {
  const { t } = useLang()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyValues, setReplyValues] = useState({})
  const [submittingId, setSubmittingId] = useState(null)
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('uqo_read_notifs') || '[]')) }
    catch { return new Set() }
  })

  const loadNotifications = useCallback(async () => {
    setIsLoading(true); setError('')
    try {
      const data = await notificationService.lister()
      setNotifications(data)
    } catch {
      setError(t.common.error)
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  const markAllRead = () => {
    const newSet = new Set(notifications.map(n => n.id))
    setReadIds(newSet)
    localStorage.setItem('uqo_read_notifs', JSON.stringify([...newSet]))
  }

  const markRead = (id) => {
    const newSet = new Set(readIds)
    newSet.add(id)
    setReadIds(newSet)
    localStorage.setItem('uqo_read_notifs', JSON.stringify([...newSet]))
  }

  const handleReplyChange = (id, value) => setReplyValues(p => ({ ...p, [id]: value }))

  const handleReplySubmit = async (notifId, requestId) => {
    const contenu = replyValues[notifId]?.trim()
    if (!contenu || contenu.length < 5) return
    setSubmittingId(notifId)
    try {
      await requestService.ajouterCommentaire(requestId, contenu)
      setReplyValues(p => ({ ...p, [notifId]: '' }))
      markRead(notifId)
      await loadNotifications()
    } catch (err) {
      setError(err.response?.data?.error || t.common.error)
    } finally { setSubmittingId(null) }
  }

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  if (isLoading) {
    return (
      <div className="notif-page-loading">
        <div className="spinner spinner-green spinner-large" />
        <span>{t.notifications.loading}</span>
      </div>
    )
  }

  return (
    <div className="notif-page">
      {/* Header */}
      <div className="notif-page-header">
        <div className="notif-page-header-left">
          <h1>🔔 {t.notifications.title}</h1>
          <p>{t.notifications.subtitle}</p>
        </div>
        {unreadCount > 0 && (
          <button className="notif-mark-all-btn" onClick={markAllRead}>
            {t.notifications.markAllRead}
          </button>
        )}
      </div>

      {error && <div className="notif-page-error">⚠ {error}</div>}

      {notifications.length === 0 ? (
        <div className="notif-page-empty">
          <div className="notif-page-empty-icon">🔔</div>
          <h3>{t.notifications.empty}</h3>
          <p>{t.notifications.emptyHint}</p>
        </div>
      ) : (
        <div className="notif-page-list">
          {notifications.map(notif => {
            const isUnread = !readIds.has(notif.id)
            const requestId = notif.demande?.id || notif.request_id
            return (
              <div
                key={notif.id}
                className={`notif-card${isUnread ? ' unread' : ''}`}
                onClick={() => markRead(notif.id)}
              >
                {/* Card header */}
                <div className="notif-card-header">
                  <div className="notif-card-icon">💬</div>
                  <div className="notif-card-meta">
                    <div className="notif-card-title">{notif.demande?.titre || t.notifications.newMessage}</div>
                    <div className="notif-card-from">
                      {notif.auteur?.nom_complet || '?'}
                      {notif.auteur?.role === 'gestionnaire' && (
                        <span className="notif-card-from-badge">{t.request.managerBadge}</span>
                      )}
                    </div>
                  </div>
                  <div className="notif-card-right">
                    <span className="notif-card-time">{formatRelativeDate(notif.date_creation)}</span>
                    {isUnread && <span className="notif-unread-dot" />}
                  </div>
                </div>

                {/* Card body */}
                <div className="notif-card-body">
                  <div className="notif-message">{notif.contenu}</div>

                  <div className="notif-actions">
                    <Link
                      to={`/requests/${requestId}`}
                      className="notif-open-btn"
                      onClick={e => e.stopPropagation()}
                    >
                      → {t.notifications.openRequest}
                    </Link>
                    {notif.demande?.statut !== 'CLOSED' && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {t.status[notif.demande?.statut] || notif.demande?.statut}
                      </span>
                    )}
                  </div>

                  {/* Reply box */}
                  {notif.demande?.statut !== 'CLOSED' && (
                    <div className="notif-reply-wrap" onClick={e => e.stopPropagation()}>
                      <span className="notif-reply-label">{t.notifications.reply}</span>
                      <textarea
                        className="notif-reply-textarea"
                        rows="2"
                        placeholder={t.notifications.replyPlaceholder}
                        value={replyValues[notif.id] || ''}
                        onChange={e => handleReplyChange(notif.id, e.target.value)}
                      />
                      <div className="notif-reply-footer">
                        <span className="notif-reply-hint">{t.request.messageMinLength}</span>
                        <button
                          className="notif-reply-btn"
                          loading={String(submittingId === notif.id)}
                          disabled={(replyValues[notif.id] || '').trim().length < 5 || submittingId === notif.id}
                          onClick={() => handleReplySubmit(notif.id, requestId)}
                        >
                          {submittingId === notif.id ? <span className="spinner" /> : '↑'}
                          {t.notifications.send}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
