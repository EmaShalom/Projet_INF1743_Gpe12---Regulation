import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import { STATUS_LABELS, REQUEST_STATUS } from '../utils/constants'
import { formatRelativeDate } from '../utils/formatters'

import Button from '../components/Button'
import Input from '../components/Input'
import Table from '../components/Table'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

import './DashboardPage.css'

const DashboardPage = () => {
  const navigate = useNavigate()

  const [requests, setRequests] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isManager = currentUser.role === 'gestionnaire'

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const res = await api.get('/requests')
        const data = res.data?.requests || []

        setRequests(data)
      } catch (error) {
        console.error('Erreur chargement demandes:', error)
        setErrorMessage("Impossible de charger les demandes pour le moment.")
      } finally {
        setIsLoading(false)
      }
    }

    loadRequests()
  }, [])

  const handleNewRequest = () => navigate('/requests/new')

  const getCreatorName = (row) => {
    return row.createur?.nom_complet || 'Utilisateur inconnu'
  }

  const statusToBadgeClass = (status) => {
    const map = {
      [REQUEST_STATUS.SUBMITTED]: 'submitted',
      [REQUEST_STATUS.IN_PROGRESS]: 'in-progress',
      [REQUEST_STATUS.RESOLVED]: 'resolved',
      [REQUEST_STATUS.CLOSED]: 'closed'
    }
    return map[status] || 'submitted'
  }

  const filteredRequests = useMemo(() => {
    let filtered = [...requests]

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((req) => req.statut === filterStatus)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (req) =>
          req.titre?.toLowerCase().includes(q) ||
          req.description?.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [requests, filterStatus, searchQuery])

  const counts = useMemo(() => {
    const total = requests.length
    const submitted = requests.filter((r) => r.statut === REQUEST_STATUS.SUBMITTED).length
    const inProgress = requests.filter((r) => r.statut === REQUEST_STATUS.IN_PROGRESS).length
    const resolved = requests.filter((r) => r.statut === REQUEST_STATUS.RESOLVED).length
    const closed = requests.filter((r) => r.statut === REQUEST_STATUS.CLOSED).length
    return { total, submitted, inProgress, resolved, closed }
  }, [requests])

  const columns = useMemo(() => {
    const base = [
      { key: 'titre', label: 'Titre' },
      { key: 'type', label: 'Catégorie' },
      {
        key: 'statut',
        label: 'Statut',
        render: (row) => (
          <Badge status={statusToBadgeClass(row.statut)}>
            {STATUS_LABELS[row.statut] || row.statut}
          </Badge>
        )
      },
      {
        key: 'date_creation',
        label: 'Date',
        render: (row) => formatRelativeDate(row.date_creation)
      }
    ]

    if (isManager) {
      base.splice(2, 0, {
        key: 'createur',
        label: 'Créé par',
        render: (row) => getCreatorName(row)
      })
    }

    return base
  }, [isManager])

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
        <div className="dashboard-header">
          <div className="header-content">
            <h1>{isManager ? '📊 Toutes les Demandes' : '📋 Mes Demandes'}</h1>
            <p>
              {isManager
                ? `Gestion de ${requests.length} demande(s) au total`
                : `Vous avez ${requests.length} demande(s)`}
            </p>
          </div>

          <Button variant="primary" size="medium" onClick={handleNewRequest}>
            ➕ Nouvelle demande
          </Button>
        </div>

        <div className="dashboard-controls">
          <div className="filter-group">
            <label>Filtrer par statut :</label>
            <div className="filter-buttons">
              <Button
                variant={filterStatus === 'ALL' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setFilterStatus('ALL')}
              >
                Tous ({counts.total})
              </Button>

              <Button
                variant={filterStatus === REQUEST_STATUS.SUBMITTED ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setFilterStatus(REQUEST_STATUS.SUBMITTED)}
              >
                Soumis ({counts.submitted})
              </Button>

              <Button
                variant={filterStatus === REQUEST_STATUS.IN_PROGRESS ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setFilterStatus(REQUEST_STATUS.IN_PROGRESS)}
              >
                En cours ({counts.inProgress})
              </Button>

              <Button
                variant={filterStatus === REQUEST_STATUS.RESOLVED ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setFilterStatus(REQUEST_STATUS.RESOLVED)}
              >
                Résolu ({counts.resolved})
              </Button>

              <Button
                variant={filterStatus === REQUEST_STATUS.CLOSED ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setFilterStatus(REQUEST_STATUS.CLOSED)}
              >
                Fermé ({counts.closed})
              </Button>
            </div>
          </div>

          <div className="search-group">
            <Input
              label="Rechercher :"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les titres ou descriptions..."
            />
          </div>
        </div>

        {errorMessage && (
          <div className="login-error" style={{ marginBottom: '16px' }}>
            ❌ {errorMessage}
          </div>
        )}

        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <h3>Aucune demande trouvée</h3>
            <p>
              {searchQuery || filterStatus !== 'ALL'
                ? 'Essayez de modifier vos filtres ou votre recherche.'
                : 'Créez votre première demande pour commencer !'}
            </p>
            {!searchQuery && filterStatus === 'ALL' && (
              <Button variant="primary" onClick={handleNewRequest}>
                Créer ma première demande
              </Button>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredRequests}
            onRowClick={(row) => setSelectedRequest(row)}
          />
        )}

        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={selectedRequest ? `Détails - ${selectedRequest.titre}` : 'Détails'}
        >
          {selectedRequest && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <b>Titre :</b> {selectedRequest.titre}
              </div>
              <div>
                <b>Catégorie :</b> {selectedRequest.type}
              </div>
              <div>
                <b>Statut :</b>{' '}
                <Badge status={statusToBadgeClass(selectedRequest.statut)}>
                  {STATUS_LABELS[selectedRequest.statut] || selectedRequest.statut}
                </Badge>
              </div>
              {isManager && (
                <div>
                  <b>Créé par :</b> {getCreatorName(selectedRequest)}
                </div>
              )}
              <div>
                <b>Date :</b> {formatRelativeDate(selectedRequest.date_creation)}
              </div>
              <div>
                <b>Description :</b>
                <div style={{ marginTop: 6, color: '#475569' }}>
                  {selectedRequest.description}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                  Fermer
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/requests/${selectedRequest.id}`)}
                >
                  Ouvrir la page
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default DashboardPage