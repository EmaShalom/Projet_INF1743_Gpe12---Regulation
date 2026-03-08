import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import './Navbar.css'
import { FaUserCircle } from 'react-icons/fa'
import logo from '../assets/logo.png'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAuthenticated = !!token

  const isDashboardPage =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/requests') ||
    location.pathname.startsWith('/notifications') ||
    (location.pathname === '/' && isAuthenticated)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-logo">
          <img src={logo} alt="UQO Requests" className="logo-img" />
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                📊 Tableau de bord
              </Link>

              <Link to="/requests/new" className="navbar-link">
                ➕ Nouvelle demande
              </Link>

              <Link to="/notifications" className="navbar-link">
                🔔 Notifications
              </Link>

              {isDashboardPage ? (
                <div className="navbar-user" ref={dropdownRef}>
                  <button
                    className="user-trigger"
                    onClick={() => setIsOpen(prev => !prev)}
                  >
                    <div className="icon-circle">
                      <FaUserCircle />
                    </div>

                    <span className="user-name">
                      {user.nom_complet || 'Utilisateur'}
                    </span>

                    <span className={`chevron ${isOpen ? 'open' : ''}`}>
                      ▾
                    </span>
                  </button>

                  {isOpen && (
                    <div className="dropdown-menu">
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          navigate('/')
                          setIsOpen(false)
                        }}
                      >
                        Accueil
                      </button>

                      <button
                        className="dropdown-item"
                        onClick={() => {
                          navigate('/notifications')
                          setIsOpen(false)
                        }}
                      >
                        Notifications
                      </button>

                      <button
                        className="dropdown-item"
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                      >
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="navbar-user">
                  <div className="icon-circle">
                    <FaUserCircle />
                  </div>
                  <span className="user-name">
                    {user.nom_complet || 'Utilisateur'}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link login-link">
                <div className="icon-circle">
                  <FaUserCircle />
                </div>
                Se connecter
              </Link>

              <Link to="/register" className="navbar-link btn-register">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar