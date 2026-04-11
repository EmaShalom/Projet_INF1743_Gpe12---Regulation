/**
 * Tests : DashboardPage
 * Vérifie le rendu des statistiques, l'état de chargement,
 * et le rendu conditionnel selon le rôle.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import { mockLang, mockUser, mockManager, mockRequests } from './utils'

vi.mock('../context/useAuth')
vi.mock('../context/LanguageContext')
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => vi.fn() }
})
vi.mock('../services/requestService', () => ({
  requestService: {
    lister: vi.fn(),
  },
}))
vi.mock('../services/notificationService', () => ({
  notificationService: { lister: vi.fn() },
}))

import { requestService } from '../services/requestService'
import { notificationService } from '../services/notificationService'

const renderDashboard = (user = mockUser) => {
  useLang.mockReturnValue(mockLang)
  useAuth.mockReturnValue({ user, estConnecte: true, isLoading: false })
  notificationService.lister.mockResolvedValue([])
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  )
}

describe('DashboardPage — état de chargement', () => {
  it('affiche le spinner pendant le chargement', () => {
    requestService.lister.mockReturnValue(new Promise(() => {})) // pending
    renderDashboard()
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })
})

describe('DashboardPage — rendu avec données', () => {
  beforeEach(() => {
    requestService.lister.mockResolvedValue(mockRequests)
  })

  it('affiche le message de bienvenue avec le prénom', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Étudiant')).toBeInTheDocument()
    })
  })

  it('affiche les 5 cartes de statistiques', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument()
      // "Soumis" appears in both the stat card and the donut legend
      expect(screen.getAllByText('Soumis').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('En cours').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Résolu').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Fermé').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('affiche le bon total de demandes', async () => {
    renderDashboard()
    await waitFor(() => {
      // mockRequests has 2 requests total
      const totalCard = screen.getAllByText('2')
      expect(totalCard.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('affiche la section des demandes récentes', async () => {
    renderDashboard()
    await waitFor(() => {
      // The section header renders with an emoji prefix: "📋 Demandes récentes"
      expect(screen.getByText(/Demandes récentes/)).toBeInTheDocument()
    })
  })

  it('affiche les titres des demandes dans le tableau', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Problème VPN')).toBeInTheDocument()
      expect(screen.getByText('Accès Moodle')).toBeInTheDocument()
    })
  })
})

describe('DashboardPage — rendu selon le rôle', () => {
  beforeEach(() => {
    requestService.lister.mockResolvedValue(mockRequests)
  })

  it('affiche le sous-titre étudiant pour un utilisateur', async () => {
    renderDashboard(mockUser)
    await waitFor(() => {
      expect(screen.getByText('Bienvenue')).toBeInTheDocument()
    })
  })

  it('affiche le sous-titre gestionnaire pour un gestionnaire', async () => {
    renderDashboard(mockManager)
    await waitFor(() => {
      expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument()
    })
  })

  it('affiche la colonne Créé par uniquement pour un gestionnaire', async () => {
    renderDashboard(mockManager)
    await waitFor(() => {
      expect(screen.getByText('Créé par')).toBeInTheDocument()
    })
  })

  it("n'affiche pas la colonne Créé par pour un utilisateur", async () => {
    renderDashboard(mockUser)
    await waitFor(() => {
      expect(screen.queryByText('Créé par')).not.toBeInTheDocument()
    })
  })
})

describe('DashboardPage — état vide', () => {
  it('affiche le message vide quand il n\'y a pas de demandes', async () => {
    requestService.lister.mockResolvedValue([])
    renderDashboard()
    await waitFor(() => {
      // Appears in both the donut chart section and the recent requests section
      expect(screen.getAllByText('Aucune demande pour le moment').length).toBeGreaterThanOrEqual(1)
    })
  })
})

describe('DashboardPage — gestion d\'erreur', () => {
  it('affiche un message d\'erreur si le chargement échoue', async () => {
    requestService.lister.mockRejectedValue(new Error('Network error'))
    renderDashboard()
    await waitFor(() => {
      // Error div renders "⚠ Impossible de charger les données."
      expect(screen.getByText(/Impossible de charger les données/)).toBeInTheDocument()
    })
  })
})
