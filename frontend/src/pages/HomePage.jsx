import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './HomePage.css'

import Button from '../components/Button'
import Card from '../components/Card'
import api from '../services/api'

const HomePage = () => {
  const navigate = useNavigate()

  const [apiMessage, setApiMessage] = useState('')

  const token = localStorage.getItem('token')
  const isAuthenticated = !!token
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    api.get('/test')
      .then((res) => {
        setApiMessage(res.data.message)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

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

            {apiMessage && (
              <p>{apiMessage}</p>
            )}

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
    </div>
  )
}

export default HomePage