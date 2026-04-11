import api from './api'

export const notificationService = {
  // GET /api/notifications/
  async lister() {
    const res = await api.get('/notifications')
    return res.data?.notifications || []
  },
}
