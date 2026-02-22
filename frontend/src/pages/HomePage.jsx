import { Link, useNavigate } from 'react-router-dom'
import './HomePage.css'

import Button from '../components/Button'
import Card from '../components/Card'

const HomePage = () => {
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const isAuthenticated = !!token
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <Card className="hero-card">
            <h1 className="hero-title">
              Gestion des requêtes
              <span className="hero-accent"> simplifiée</span>
            </h1>

            <p className="hero-subtitle">
              Soumettez, suivez et gérez vos requêtes administratives
              en toute simplicité, depuis un seul espace sécurisé.
            </p>

            {/* ✅ petit statut pro */}
            {isAuthenticated && (
              <div className="hero-user">
                Connecté : <strong>{currentUser?.nom_complet || 'Utilisateur'}</strong>
                {currentUser?.role && (
                  <span className="hero-user-role">
                    ({currentUser.role === 'gestionnaire' ? 'Gestionnaire' : 'Utilisateur'})
                  </span>
                )}
              </div>
            )}

            <div className="hero-actions">
              <Button
                variant="primary"
                size="large"
                onClick={() => {
                  if (!isAuthenticated) navigate('/login')
                  else navigate('/requests/new')
                }}
              >
                Créer une requête
              </Button>

              {!isAuthenticated ? (
                <Link to="/login" className="home-link-btn">
                  <Button variant="secondary" size="large">
                    Se connecter
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                  >
                    Aller au dashboard
                  </Button>

                  <Button
                    variant="danger"
                    size="large"
                    onClick={handleLogout}
                  >
                    Se déconnecter
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="section-inner">
          <h2 className="section-title">Fonctionnalités</h2>

          <div className="features">
            <Card className="feature-card" title="📌 Suivi des requêtes">
              <p>Visualisez le statut de vos demandes en temps réel.</p>
            </Card>

            <Card className="feature-card" title="📊 Dashboard">
              <p>Accédez aux statistiques et indicateurs clés.</p>
            </Card>

            <Card className="feature-card" title="🔔 Notifications">
              <p>Recevez des alertes lors des changements de statut.</p>
            </Card>

            <Card className="feature-card" title="🧾 Historique">
              <p>Consultez toutes vos requêtes passées.</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage