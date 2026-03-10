import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import './Navbar.css'
import { FaUserCircle, FaBars } from 'react-icons/fa'
import logo from '../assets/logo.png'

const Navbar = ({ isAuthenticated, onOpenSidebar }) => {
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

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
    <nav className="topbar">
      <div className="topbar-container">
        <div className="topbar-left">
          {isAuthenticated && (
            <button className="menu-toggle" onClick={onOpenSidebar}>
              <FaBars />
            </button>
          )}

          <Link to={isAuthenticated ? '/dashboard' : '/'} className="topbar-logo">
            <img src={logo} alt="UQO Requests" className="logo-img" />
          </Link>
        </div>

        <div className="topbar-right">
          {isAuthenticated ? (
            <div className="topbar-user" ref={dropdownRef}>
              <button
                className="user-trigger"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                <div className="icon-circle">
                  <FaUserCircle />
                </div>

                <span className="user-name">
                  {user.nom_complet || 'Utilisateur'}
                </span>

                <span className={`chevron ${isOpen ? 'open' : ''}`}>▾</span>
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
                      navigate('/dashboard')
                      setIsOpen(false)
                    }}
                  >
                    Tableau de bord
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
            <div className="topbar-auth">
              <Link to="/login" className="topbar-link">Se connecter</Link>
              <Link to="/register" className="topbar-register">S'inscrire</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar