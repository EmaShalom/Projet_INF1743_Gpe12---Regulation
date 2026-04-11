import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { requestService } from '../services/requestService'
import { REQUEST_STATUS } from '../utils/constants'
import { formatDateTime, formatRelativeDate } from '../utils/formatters'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import './RequestDetailPage.css'

const statusBadgeCls = (s) => ({
  SUBMITTED: 'detail-badge-submitted', IN_PROGRESS: 'detail-badge-in-progress',
  RESOLVED: 'detail-badge-resolved', CLOSED: 'detail-badge-closed'
}[s] || 'detail-badge-submitted')

const RequestDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useLang()

  const [request, setRequest] = useState(null)
  const [comments, setComments] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState(location.state?.message || '')
  const [errorMessage, setErrorMessage] = useState('')
  const messagesEndRef = useRef(null)

  const isManager = user?.role === 'gestionnaire'

  const canEdit = useMemo(() => {
    if (!request) return false
    return request.createur_id === user?.id && request.statut === REQUEST_STATUS.SUBMITTED
  }, [request, user])

  const canComment = useMemo(() => {
    if (!request || request.statut === REQUEST_STATUS.CLOSED) return false
    return request.createur_id === user?.id || isManager
  }, [request, user, isManager])

  const loadRequest = async () => {
    setIsLoading(true); setError(null)
    try {
      const data = await requestService.obtenir(id)
      if (!data) { setError(t.request.notFound); return }
      setRequest(data)
      setComments(data.commentaires || [])
      setStatusHistory(data.historique || [])
    } catch (err) {
      if (err.response?.status === 403) { setError(t.request.noAccess); setTimeout(() => navigate('/dashboard'), 2000) }
      else if (err.response?.status === 404) setError(t.request.notFound)
      else setError(t.common.error)
    } finally { setIsLoading(false) }
  }

  useEffect(() => { loadRequest() }, [id])

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (newComment.trim().length < 5) return
    setIsSubmitting(true); setErrorMessage('')
    try {
      const created = await requestService.ajouterCommentaire(id, newComment)
      if (created) setComments(p => [...p, created])
      setNewComment('')
    } catch (err) {
      setErrorMessage(err.response?.data?.error || t.common.error)
    } finally { setIsSubmitting(false) }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setErrorMessage(''); setStatusMessage('')
      await requestService.changerStatut(id, newStatus, `Statut → ${newStatus}`)
      setStatusMessage(t.request.statusChanged)
      await loadRequest()
    } catch (err) {
      setErrorMessage(err.response?.data?.error || t.common.error)
    }
  }

  const getAvatar = (name) => name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'U'

  const isMyMessage = (comment) => comment.auteur?.id === user?.id || comment.auteur_id === user?.id
  const isManagerMessage = (comment) => comment.auteur?.role === 'gestionnaire'

  if (isLoading) {
    return (
      <div className="detail-loading">
        <div className="spinner spinner-green spinner-large" />
        <span>{t.request.loading}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="detail-error">
        <div className="detail-error-icon">⚠️</div>
        <h2>{t.common.error}</h2>
        <p>{error}</p>
        <button className="detail-back-btn" onClick={() => navigate('/dashboard')}>
          ← {t.request.backToDashboard}
        </button>
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <nav className="detail-breadcrumb">
        <Link to="/dashboard">{t.request.backToDashboard}</Link>
        <span className="detail-breadcrumb-sep">›</span>
        <span className="detail-breadcrumb-current">{t.request.request} #{request.id}</span>
      </nav>

      {statusMessage && <div className="detail-alert-success">✅ {statusMessage}</div>}
      {errorMessage && <div className="detail-alert-error">⚠ {errorMessage}</div>}

      {/* Title row */}
      <div className="detail-title-row">
        <div className="detail-title-left">
          <h1 className="detail-title">{request.titre}</h1>
          <div className="detail-badges">
            <span className={`detail-status-badge ${statusBadgeCls(request.statut)}`}>
              {t.status[request.statut] || request.statut}
            </span>
            <span className="detail-type-badge">{request.type}</span>
          </div>
        </div>
        {canEdit && (
          <button className="detail-edit-btn" onClick={() => navigate(`/requests/${id}/edit`)}>
            ✏ {t.request.edit}
          </button>
        )}
      </div>

      {/* Two-column layout */}
      <div className="detail-layout">
        {/* LEFT COLUMN: info + description + status + history */}
        <div>
          {/* Info card */}
          <div className="detail-card">
            <div className="detail-card-header">
              <span className="detail-card-title">ℹ️ {t.request.info}</span>
            </div>
            <div className="detail-card-body">
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span className="detail-info-label">{t.request.createdBy}</span>
                  <span className="detail-info-value">{request.createur?.nom_complet || '—'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">{t.request.status}</span>
                  <span className={`detail-status-badge ${statusBadgeCls(request.statut)}`} style={{ alignSelf: 'flex-start', marginTop: 1 }}>
                    {t.status[request.statut] || request.statut}
                  </span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">{t.request.createdAt}</span>
                  <span className="detail-info-value">{formatDateTime(request.date_creation)}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">{t.request.updatedAt}</span>
                  <span className="detail-info-value">{formatDateTime(request.date_modification)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="detail-card">
            <div className="detail-card-header">
              <span className="detail-card-title">📝 {t.request.description}</span>
            </div>
            <div className="detail-card-body">
              <p className="detail-description">{request.description}</p>
            </div>
          </div>

          {/* Manager: status controls */}
          {isManager && (
            <div className="detail-card">
              <div className="detail-card-header">
                <span className="detail-card-title">🛠 {t.request.manageStatus}</span>
              </div>
              <div className="detail-card-body">
                <div className="detail-status-btns">
                  <button className="detail-status-btn detail-status-btn-progress"
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={request.statut === 'IN_PROGRESS'}>
                    🔄 {t.request.setInProgress}
                  </button>
                  <button className="detail-status-btn detail-status-btn-resolved"
                    onClick={() => handleStatusChange('RESOLVED')}
                    disabled={request.statut === 'RESOLVED'}>
                    ✅ {t.request.setResolved}
                  </button>
                  <button className="detail-status-btn detail-status-btn-closed"
                    onClick={() => handleStatusChange('CLOSED')}
                    disabled={request.statut === 'CLOSED'}>
                    🔒 {t.request.setClosed}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {statusHistory.length > 0 && (
            <div className="detail-card">
              <div className="detail-card-header">
                <span className="detail-card-title">🕘 {t.request.history}</span>
              </div>
              <div className="detail-card-body">
                <div className="detail-history">
                  {statusHistory.map(entry => (
                    <div className="history-item" key={entry.id}>
                      <div className="history-dot">→</div>
                      <div className="history-content">
                        <div className="history-text">
                          <strong>{entry.modifie_par?.nom_complet || '?'}</strong>{' '}
                          {t.request.history.includes('History') ? 'changed status to' : 'a changé le statut vers'}{' '}
                          <span className={`detail-status-badge ${statusBadgeCls(entry.nouveau_statut)}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                            {t.status[entry.nouveau_statut] || entry.nouveau_statut}
                          </span>
                        </div>
                        <div className="history-time">{formatRelativeDate(entry.date_modification)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: conversation thread */}
        <div>
          <div className="detail-card conversation-wrap">
            <div className="detail-card-header">
              <span className="detail-card-title">
                💬 {t.request.conversation}
                <span style={{ marginLeft: 'var(--space-2)', fontSize: '11px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--color-text-muted)' }}>
                  {comments.length}
                </span>
              </span>
            </div>

            <div className="conversation-messages">
              {comments.length === 0 ? (
                <div className="conv-empty">
                  <span className="conv-empty-icon">💬</span>
                  <span className="conv-empty-text">{t.request.noMessages}</span>
                </div>
              ) : (
                comments.map(comment => {
                  const isMine = isMyMessage(comment)
                  const isMgr = isManagerMessage(comment)
                  const name = comment.auteur?.nom_complet || 'User'
                  return (
                    <div key={comment.id} className={`conv-message${isMine ? ' from-me' : ''}`}>
                      <div className={`conv-avatar ${isMgr ? 'conv-avatar-manager' : 'conv-avatar-user'}`}>
                        {getAvatar(name)}
                      </div>
                      <div className="conv-bubble-wrap">
                        <div className="conv-sender">
                          {name}
                          {isMgr && <span style={{ marginLeft: '4px', fontSize: '10px', background: 'var(--green-100)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>{t.request.managerBadge}</span>}
                        </div>
                        <div className={`conv-bubble ${isMine ? 'conv-bubble-me' : isMgr ? 'conv-bubble-manager' : 'conv-bubble-user'}`}>
                          {comment.contenu}
                        </div>
                        <div className="conv-time">{formatRelativeDate(comment.date_creation)}</div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="conv-input-area">
              {request.statut === REQUEST_STATUS.CLOSED ? (
                <div className="conv-closed-msg">🔒 {t.request.closedMessage}</div>
              ) : canComment ? (
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    className="conv-textarea"
                    rows="3"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder={t.request.messagePlaceholder}
                    disabled={isSubmitting}
                  />
                  <div className="conv-input-footer">
                    <span className="conv-input-hint">{t.request.messageMinLength}</span>
                    <button
                      type="submit"
                      className="conv-send-btn"
                      disabled={newComment.trim().length < 5 || isSubmitting}
                    >
                      {isSubmitting ? <span className="spinner" /> : '↑'}
                      {t.request.sendMessage}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestDetailPage
