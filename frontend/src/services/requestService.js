// frontend/src/services/requestService.js — I1 (Membre 6)
// Service CRUD pour les demandes — toutes les fonctions qui appellent l'API
// Utilise l'instance Axios centralisée (api.js, Membre 1)

import api from './api'

export const requestService = {
  // GET /api/requests
  async lister() {
    const res = await api.get('/requests')
    return res.data.requests
  },

  // GET /api/requests/:id (inclut commentaires + historique)
  async obtenir(id) {
    const res = await api.get(`/requests/${id}`)
    return res.data.request
  },

  // POST /api/requests
  async creer(data) {
    const res = await api.post('/requests', data)
    return res.data.request
  },

  // PUT /api/requests/:id
  async modifier(id, data) {
    const res = await api.put(`/requests/${id}`, data)
    return res.data.request
  },

  // PATCH /api/requests/:id/status
  async changerStatut(id, statut, commentaire = '') {
    const res = await api.patch(`/requests/${id}/status`, { statut, commentaire })
    return res.data.request // ✅ plus utile que res.data
  },

  // DELETE /api/requests/:id
  async supprimer(id) {
    const res = await api.delete(`/requests/${id}`)
    return res.data
  },

  // ⚠️ À garder seulement si vous avez réellement une API /comments
  // Sinon: 404
  async listerCommentaires(id) {
    const res = await api.get(`/requests/${id}/comments`)
    return res.data.comments
  },

  async ajouterCommentaire(id, contenu) {
    const res = await api.post(`/requests/${id}/comments`, { contenu })
    return res.data.comment
  },
}