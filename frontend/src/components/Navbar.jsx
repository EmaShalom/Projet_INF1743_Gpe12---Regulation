import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaSearch, FaCog, FaPlus } from 'react-icons/fa'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import NotificationBell from './NotificationBell'
import logo from '../assets/logo.png'
import './Navbar.css'

const Navbar = ({ isAuthenticated, onMobileToggle }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t, lang, toggleLang } = useLang()
  const [search, setSearch] = useState('')

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return t.dashboard.goodMorning
    if (h < 18) return t.dashboard.goodAfternoon
    return t.dashboard.goodEvening
  }, [t])

  const today = useMemo(() => {
    return new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }, [lang])

  const firstName = user?.nom_complet?.split(' ')[0] || ''

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/my-requests?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className={`topbar${!isAuthenticated ? ' topbar-public' : ''}`}>

      {/* ── Logo ── */}
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="topbar-brand">
        <img src={logo} alt="UQO" className="topbar-logo" />
        <div className="topbar-brand-text">
          <span className="topbar-brand-name">UQO Requests</span>
          <span className="topbar-brand-sub">Université du Québec en Outaouais</span>
        </div>
      </Link>

      {/* ── Welcome section ── */}
      {isAuthenticated && user && (
        <div className="topbar-welcome">
          <div className="topbar-welcome-greeting">
            {greeting}{firstName ? ', ' : ''}<strong>{firstName}</strong>
          </div>
          <div className="topbar-welcome-date">{today}</div>
        </div>
      )}

      {/* ── Search bar ── */}
      {isAuthenticated && (
        <div className="topbar-search-wrap">
          <span className="topbar-search-icon"><FaSearch /></span>
          <input
            className="topbar-search"
            type="text"
            placeholder={lang === 'fr' ? 'Rechercher une demande...' : 'Search a request...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      )}

      <div className="topbar-spacer" />

      {/* ── Right controls ── */}
      <div className="topbar-controls">
        {/* Language toggle */}
        <button className="topbar-lang-btn" onClick={toggleLang} title="Switch language">
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>

        {isAuthenticated ? (
          <>
            {/* Settings */}
            <button
              className={`topbar-icon-btn${location.pathname === '/settings' ? ' active' : ''}`}
              onClick={() => navigate('/settings')}
              title={lang === 'fr' ? 'Paramètres' : 'Settings'}
            >
              <FaCog />
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* New Request */}
            <button className="topbar-new-btn" onClick={() => navigate('/requests/new')}>
              <FaPlus className="topbar-new-icon" />
              <span>{t.nav.newRequest}</span>
            </button>
          </>
        ) : (
          <div className="topbar-auth-links">
            <Link to="/login" className="topbar-login-link">{t.nav.login}</Link>
            <Link to="/register" className="topbar-register-btn">{t.nav.register}</Link>
          </div>
        )}
      </div>

      {/* ── Mobile hamburger ── */}
      {isAuthenticated && (
        <button className="topbar-mobile-toggle" onClick={onMobileToggle} aria-label="Menu">
          ☰
        </button>
      )}
    </header>
  )
}

export default Navbar
