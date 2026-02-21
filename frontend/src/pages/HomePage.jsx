import { Link, useNavigate } from 'react-router-dom'
import './HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()

  // =========================
  // AUTHENTIFICATION
  // =========================
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Retour à la Home NON connecté
    navigate('/')
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-card">

            <h1 className="hero-title">
              Gestion des requêtes
              <span className="hero-accent"> simplifiée</span>
            </h1>

            <p className="hero-subtitle">
              Soumettez, suivez et gérez vos requêtes administratives
              en toute simplicité, depuis un seul espace sécurisé.
            </p>

            <div className="hero-actions">

              {/* =========================
                 BOUTON PRINCIPAL
                 ========================= */}
              <button
                className="primary-btn"
                onClick={() => {
                  // Si non connecté → login
                  if (!isAuthenticated) {
                    navigate('/login')
                  } else {
                    navigate('/requests/new')
                  }
                }}
              >
                Créer une requête
              </button>

              {/* =========================
                 UTILISATEUR NON CONNECTÉ
                 ========================= */}
              {!isAuthenticated && (
                <Link to="/login" className="secondary-btn">
                  Se connecter
                </Link>
              )}

              {/* =========================
                 UTILISATEUR CONNECTÉ
                 ========================= */}
              {isAuthenticated && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </button>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="section-inner">
          <h2 className="section-title">Fonctionnalités</h2>

          <div className="features">
            <div className="feature-card">
              <h3>📌 Suivi des requêtes</h3>
              <p>Visualisez le statut de vos demandes en temps réel.</p>
            </div>

            <div className="feature-card">
              <h3>📊 Dashboard</h3>
              <p>Accédez aux statistiques et indicateurs clés.</p>
            </div>

            <div className="feature-card">
              <h3>🔔 Notifications</h3>
              <p>Recevez des alertes lors des changements de statut.</p>
            </div>

            <div className="feature-card">
              <h3>🧾 Historique</h3>
              <p>Consultez toutes vos requêtes passées.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default HomePage