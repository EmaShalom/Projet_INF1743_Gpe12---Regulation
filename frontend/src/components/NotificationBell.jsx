import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaCommentDots, FaExchangeAlt } from 'react-icons/fa'
import { notificationService } from '../services/notificationService'
import { useLang } from '../context/LanguageContext'
import './NotificationBell.css'

const timeAgo = (dateStr, t) => {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return t.common.just_now
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}j`
}

const NotificationBell = () => {
  const { t } = useLang()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('uqo_read_notifs') || '[]')) }
    catch { return new Set() }
  })
  const panelRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await notificationService.lister()
      setNotifications(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const iv = setInterval(fetchNotifications, 30000)
    return () => clearInterval(iv)
  }, [fetchNotifications])

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  const persistRead = (newSet) => {
    setReadIds(newSet)
    localStorage.setItem('uqo_read_notifs', JSON.stringify([...newSet]))
  }

  const markAllRead = (e) => {
    e.stopPropagation()
    persistRead(new Set(notifications.map(n => n.id)))
  }

  const handleClick = (notif) => {
    const newSet = new Set(readIds)
    newSet.add(notif.id)
    persistRead(newSet)
    setOpen(false)
    navigate(`/requests/${notif.demande?.id || notif.request_id || notif.id}`)
  }

  const getIcon = (notif) => {
    if (notif.type === 'status') return { el: <FaExchangeAlt />, cls: 'notif-icon-status' }
    return { el: <FaCommentDots />, cls: 'notif-icon-message' }
  }

  return (
    <div className="notif-bell-wrap" ref={panelRef}>
      <button
        className={`notif-bell-btn${unreadCount > 0 ? ' has-unread' : ''}`}
        onClick={() => setOpen(p => !p)}
        aria-label={t.notifications.title}
        title={t.notifications.title}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <div className="notif-panel-title">
              <FaBell />
              {t.notifications.title}
              {unreadCount > 0 && (
                <span className="notif-panel-count">{unreadCount} {t.notifications.markAllRead.includes('Tout') ? 'non lus' : 'unread'}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                {t.notifications.markAllRead}
              </button>
            )}
          </div>

          {loading ? (
            <div className="notif-loading">
              <div className="spinner spinner-green" />
              {t.notifications.loading}
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon">🔔</span>
              <span className="notif-empty-title">{t.notifications.empty}</span>
              <span className="notif-empty-hint">{t.notifications.emptyHint}</span>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.slice(0, 6).map(notif => {
                const isUnread = !readIds.has(notif.id)
                const { el, cls } = getIcon(notif)
                return (
                  <div
                    key={notif.id}
                    className={`notif-item${isUnread ? ' unread' : ''}`}
                    onClick={() => handleClick(notif)}
                  >
                    <div className={`notif-item-icon-wrap ${cls}`}>{el}</div>
                    <div className="notif-item-body">
                      <div className="notif-item-title">
                        {notif.demande?.titre || t.notifications.newMessage}
                      </div>
                      <div className="notif-item-snippet">
                        {notif.auteur?.nom_complet && (
                          <strong>{notif.auteur.nom_complet}: </strong>
                        )}
                        {notif.contenu}
                      </div>
                      <div className="notif-item-meta">
                        <span className="notif-item-time">{timeAgo(notif.date_creation, t)}</span>
                        {isUnread && <span className="notif-unread-dot" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="notif-panel-footer">
            <button className="notif-see-all" onClick={() => { setOpen(false); navigate('/notifications') }}>
              {t.notifications.seeAll} →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
