import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaBell,
  FaFileAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from 'react-icons/fa'
import api from '../services/api'
import './Sidebar.css'

const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isManager = user.role === 'gestionnaire'

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/')
        const notifications = res.data?.notifications || res.data || []
        const unread = notifications.filter((n) => !n.lu).length
        setUnreadCount(unread)
      } catch (err) {
        console.error('Erreur notifications:', err)
      }
    }

    fetchUnread()

    // Rafraîchit toutes les 30 secondes
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [location.pathname])

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            {!isCollapsed && (
              <div>
                <h3>UQO Requests</h3>
                <p>{user.nom_complet || 'Utilisateur'}</p>
              </div>
            )}
            <button className="sidebar-mobile-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <button className="sidebar-collapse-btn" onClick={onToggleCollapse}>
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={onClose}
          >
            <FaTachometerAlt className="sidebar-icon" />
            {!isCollapsed && <span>Tableau de bord</span>}
          </Link>

          <Link
            to="/requests/new"
            className={`sidebar-link ${isActive('/requests/new') ? 'active' : ''}`}
            onClick={onClose}
          >
            <FaPlusCircle className="sidebar-icon" />
            {!isCollapsed && <span>Nouvelle demande</span>}
          </Link>

          <Link
            to="/notifications"
            className={`sidebar-link ${isActive('/notifications') ? 'active' : ''}`}
            onClick={onClose}
          >
            <div className="sidebar-icon-wrapper">
              <FaBell className="sidebar-icon" />
              {unreadCount > 0 && (
                <span className="notif-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            {!isCollapsed && <span>Notifications</span>}
          </Link>

          <Link
            to="/dashboard"
            className={`sidebar-link ${isActive('/requests') ? 'active' : ''}`}
            onClick={onClose}
          >
            <FaFileAlt className="sidebar-icon" />
            {!isCollapsed && <span>{isManager ? 'Toutes les demandes' : 'Mes demandes'}</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt className="sidebar-icon" />
            {!isCollapsed && <span>Se déconnecter</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar