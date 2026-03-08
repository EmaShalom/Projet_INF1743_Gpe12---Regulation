// frontend/src/services/authService.js — I1 (Membre 2)
// Service d'authentification — appels API inscription et connexion
// Utilise l'instance Axios centralisée définie par le Membre 1 (I2)
import api from './api';

export const authService = {

  /**
   * Inscription — POST /api/auth/register
   * @param {{ nom_complet, email, password, confirmation }} data
   * @returns {{ message, user: { id, nom_complet, email, role } }}
   * @throws AxiosError avec response.data.erreurs en cas de 400/409
   */
  async inscrire(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  /**
   * Connexion — POST /api/auth/login
   * @param {string} email
   * @param {string} password
   * @returns {{ token, user: { id, nom_complet, email, role } }}
   * @throws AxiosError avec response.data.error en cas de 401
   */
  async connecter(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // { token, user }
  },
};
