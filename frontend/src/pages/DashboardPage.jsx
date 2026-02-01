import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockRequests, mockUsers } from '../mockData'
import { STATUS_LABELS, STATUS_COLORS, REQUEST_STATUS } from '../utils/constants'
import { formatRelativeDate } from '../utils/formatters'
import './DashboardPage.css'

const DashboardPage = () => {
  const navigate = useNavigate()
  
  // ==================== ÉTAT ====================
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Récupérer l'utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isManager = currentUser.role === 'gestionnaire'
  
  // ==================== CHARGEMENT DES DONNÉES ====================
  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true)
      
      try {
        // L1 : Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Filtrer selon le rôle
        let userRequests
        if (isManager) {
          // Gestionnaire voit TOUTES les demandes
          userRequests = mockRequests
        } else {
          // Utilisateur voit SEULEMENT ses demandes
          userRequests = mockRequests.filter(
            req => req.createur_id === currentUser.id
          )
        }
        
        // Trier par date (plus récentes en premier)
        userRequests.sort((a, b) => 
          new Date(b.date_creation) - new Date(a.date_creation)
        )
        
        setRequests(userRequests)
        setFilteredRequests(userRequests)
        
        // TODO L2 : Appeler l'API
        // const response = await fetch('/api/requests/', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // })
        // const data = await response.json()
        // setRequests(data)
        
      } catch (error) {
        console.error('Erreur chargement demandes:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadRequests()
  }, [currentUser.id, isManager])
  
  // ==================== FILTRAGE ====================
  useEffect(() => {
    let filtered = [...requests]
    
    // Filtre par statut
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(req => req.statut === filterStatus)
    }
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(req =>
        req.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredRequests(filtered)
  }, [requests, filterStatus, searchQuery])
  
  // ==================== GESTIONNAIRES ====================
  const handleRequestClick = (requestId) => {
    navigate(`/requests/${requestId}`)
  }
  
  const handleNewRequest = () => {
    navigate('/requests/new')
  }
  
  const getCreatorName = (creatorId) => {
    const user = mockUsers.find(u => u.id === creatorId)
    return user ? user.nom_complet : 'Utilisateur inconnu'
  }
  
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      [REQUEST_STATUS.SUBMITTED]: 'status-submitted',
      [REQUEST_STATUS.IN_PROGRESS]: 'status-in-progress',
      [REQUEST_STATUS.RESOLVED]: 'status-resolved',
      [REQUEST_STATUS.CLOSED]: 'status-closed'
    }
    return statusClasses[status] || 'status-default'
  }
  
  // ==================== RENDU ====================
  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Chargement des demandes...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* En-tête */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>
              {isManager ? '📊 Toutes les Demandes' : '📋 Mes Demandes'}
            </h1>
            <p>
              {isManager 
                ? `Gestion de ${requests.length} demande(s) au total`
                : `Vous avez ${requests.length} demande(s)`
              }
            </p>
          </div>
          <button 
            className="btn-new-request"
            onClick={handleNewRequest}
          >
            ➕ Nouvelle demande
          </button>
        </div>
        
        {/* Filtres et recherche */}
        <div className="dashboard-controls">
          {/* Filtres par statut */}
          <div className="filter-group">
            <label>Filtrer par statut :</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterStatus('ALL')}
              >
                Tous ({requests.length})
              </button>
              <button
                className={`filter-btn ${filterStatus === REQUEST_STATUS.SUBMITTED ? 'active' : ''}`}
                onClick={() => setFilterStatus(REQUEST_STATUS.SUBMITTED)}
              >
                Soumis ({requests.filter(r => r.statut === REQUEST_STATUS.SUBMITTED).length})
              </button>
              <button
                className={`filter-btn ${filterStatus === REQUEST_STATUS.IN_PROGRESS ? 'active' : ''}`}
                onClick={() => setFilterStatus(REQUEST_STATUS.IN_PROGRESS)}
              >
                En cours ({requests.filter(r => r.statut === REQUEST_STATUS.IN_PROGRESS).length})
              </button>
              <button
                className={`filter-btn ${filterStatus === REQUEST_STATUS.RESOLVED ? 'active' : ''}`}
                onClick={() => setFilterStatus(REQUEST_STATUS.RESOLVED)}
              >
                Résolu ({requests.filter(r => r.statut === REQUEST_STATUS.RESOLVED).length})
              </button>
              <button
                className={`filter-btn ${filterStatus === REQUEST_STATUS.CLOSED ? 'active' : ''}`}
                onClick={() => setFilterStatus(REQUEST_STATUS.CLOSED)}
              >
                Fermé ({requests.filter(r => r.statut === REQUEST_STATUS.CLOSED).length})
              </button>
            </div>
          </div>
          
          {/* Recherche */}
          <div className="search-group">
            <label htmlFor="search">Rechercher :</label>
            <input
              type="text"
              id="search"
              className="search-input"
              placeholder="Rechercher dans les titres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Liste des demandes */}
        <div className="requests-list">
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <h3>Aucune demande trouvée</h3>
              <p>
                {searchQuery || filterStatus !== 'ALL'
                  ? 'Essayez de modifier vos filtres ou votre recherche.'
                  : 'Créez votre première demande pour commencer !'
                }
              </p>
              {!searchQuery && filterStatus === 'ALL' && (
                <button 
                  className="btn-primary"
                  onClick={handleNewRequest}
                >
                  Créer ma première demande
                </button>
              )}
            </div>
          ) : (
            filteredRequests.map(request => (
              <div
                key={request.id}
                className="request-card"
                onClick={() => handleRequestClick(request.id)}
              >
                <div className="request-header">
                  <h3 className="request-title">{request.titre}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(request.statut)}`}>
                    {STATUS_LABELS[request.statut]}
                  </span>
                </div>
                
                <p className="request-description">
                  {request.description.substring(0, 150)}
                  {request.description.length > 150 && '...'}
                </p>
                
                <div className="request-meta">
                  <span className="meta-item">
                    🏷️ {request.type}
                  </span>
                  {isManager && (
                    <span className="meta-item">
                      👤 {getCreatorName(request.createur_id)}
                    </span>
                  )}
                  <span className="meta-item">
                    📅 {formatRelativeDate(request.date_creation)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage