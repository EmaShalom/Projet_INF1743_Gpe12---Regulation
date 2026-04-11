import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FaHome, FaTachometerAlt, FaBell,
  FaFileAlt, FaCog, FaSignOutAlt,
} from 'react-icons/fa'
import { notificationService } from '../services/notificationService'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import './Sidebar.css'

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useLang()
  const [unreadCount, setUnreadCount] = useState(0)

  const isManager = user?.role === 'gestionnaire'

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const all = await notificationService.lister()
        const stored = new Set(JSON.parse(localStorage.getItem('uqo_read_notifs') || '[]'))
        setUnreadCount(all.filter(n => !stored.has(n.id)).length)
      } catch { /* silent */ }
    }
    fetchUnread()
    const iv = setInterval(fetchUnread, 30000)
    return () => clearInterval(iv)
  }, [location.pathname])

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/dashboard' && path !== '/' && location.pathname.startsWith(path))

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleLinkClick = () => {
    if (isMobileOpen) onMobileClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${isMobileOpen ? ' show' : ''}`}
        onClick={onMobileClose}
      />

      <aside className={`sidebar${isMobileOpen ? ' mobile-open' : ''}`}>

        {/* ── Top nav links ── */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">{t.nav.home}</div>

          <Link
            to="/"
            className={`sidebar-link${isActive('/') && location.pathname === '/' ? ' active' : ''}`}
            onClick={handleLinkClick}
            title={t.nav.home}
          >
            <FaHome className="sidebar-icon" />
            <span className="sidebar-link-text">{t.nav.home}</span>
          </Link>

          <Link
            to="/dashboard"
            className={`sidebar-link${isActive('/dashboard') ? ' active' : ''}`}
            onClick={handleLinkClick}
            title={t.nav.dashboard}
          >
            <FaTachometerAlt className="sidebar-icon" />
            <span className="sidebar-link-text">{t.nav.dashboard}</span>
          </Link>

          <div className="sidebar-divider" />
          <div className="sidebar-nav-section">{isManager ? t.nav.allRequests : t.nav.myRequests}</div>

          <Link
            to="/my-requests"
            className={`sidebar-link${isActive('/my-requests') ? ' active' : ''}`}
            onClick={handleLinkClick}
            title={isManager ? t.nav.allRequests : t.nav.myRequests}
          >
            <FaFileAlt className="sidebar-icon" />
            <span className="sidebar-link-text">{isManager ? t.nav.allRequests : t.nav.myRequests}</span>
          </Link>

          <Link
            to="/notifications"
            className={`sidebar-link${isActive('/notifications') ? ' active' : ''}`}
            onClick={handleLinkClick}
            title={t.nav.notifications}
          >
            <div className="sidebar-notif-wrap">
              <FaBell className="sidebar-icon" />
              {unreadCount > 0 && (
                <span className="sidebar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </div>
            <span className="sidebar-link-text">{t.nav.notifications}</span>
          </Link>
        </nav>

        {/* ── Bottom section ── */}
        <div className="sidebar-footer">
          <Link
            to="/settings"
            className={`sidebar-link sidebar-settings${isActive('/settings') ? ' active' : ''}`}
            onClick={handleLinkClick}
            title="Paramètres / Settings"
          >
            <FaCog className="sidebar-icon" />
            <span className="sidebar-link-text">Paramètres</span>
          </Link>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
            title={t.nav.logout}
          >
            <FaSignOutAlt className="sidebar-icon" />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
