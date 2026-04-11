/**
 * Tests : ProtectedRoute
 * Vérifie la navigation selon l'état d'authentification.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/useAuth'

vi.mock('../context/useAuth')

const renderRoute = (authState) => {
  useAuth.mockReturnValue(authState)
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Page de connexion</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Contenu protégé</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  describe('utilisateur non authentifié', () => {
    it('redirige vers /login', () => {
      renderRoute({ estConnecte: false, isLoading: false })
      expect(screen.getByText('Page de connexion')).toBeInTheDocument()
    })

    it("n'affiche pas le contenu protégé", () => {
      renderRoute({ estConnecte: false, isLoading: false })
      expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument()
    })
  })

  describe('utilisateur authentifié', () => {
    it('affiche le contenu de la page protégée', () => {
      renderRoute({ estConnecte: true, isLoading: false })
      expect(screen.getByText('Contenu protégé')).toBeInTheDocument()
    })

    it('ne redirige pas vers /login', () => {
      renderRoute({ estConnecte: true, isLoading: false })
      expect(screen.queryByText('Page de connexion')).not.toBeInTheDocument()
    })
  })

  describe('chargement en cours', () => {
    it('ne rend rien pendant le chargement (évite le flash de redirection)', () => {
      useAuth.mockReturnValue({ estConnecte: false, isLoading: true })
      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Contenu</div>
          </ProtectedRoute>
        </MemoryRouter>
      )
      expect(container.firstChild).toBeNull()
    })
  })
})
