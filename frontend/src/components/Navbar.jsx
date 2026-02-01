import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate()
  
  // Vérifier si l'utilisateur est connecté
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAuthenticated = !!token
  
  const handleLogout = () => {
    // Supprimer token et user
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Rediriger vers login
    navigate('/login')
  }
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-logo">
          🎓 UQO-Requests
        </Link>
        
        {/* Menu */}
        <div className="navbar-menu">
          {isAuthenticated ? (
            // Menu utilisateur connecté
            <>
              <Link to="/dashboard" className="navbar-link">
                📊 Tableau de bord
              </Link>
              <Link to="/requests/new" className="navbar-link">
                ➕ Nouvelle demande
              </Link>
              <div className="navbar-user">
                <span className="user-name">👤 {user.nom_complet || 'Utilisateur'}</span>
                <button onClick={handleLogout} className="btn-logout">
                  🚪 Se déconnecter
                </button>
              </div>
            </>
          ) : (
            // Menu visiteur non connecté
            <>
              <Link to="/login" className="navbar-link">
                🔑 Se connecter
              </Link>
              <Link to="/register" className="navbar-link btn-register">
                ✨ S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar