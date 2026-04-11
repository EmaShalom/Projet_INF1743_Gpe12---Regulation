/**
 * Tests : MyRequestsPage
 * Vérifie le rendu de la liste, la recherche, les filtres par statut,
 * et le rendu conditionnel selon le rôle.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MyRequestsPage from '../pages/MyRequestsPage'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import { mockLang, mockUser, mockManager, mockRequests } from './utils'

vi.mock('../context/useAuth')
vi.mock('../context/LanguageContext')
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  }
})
vi.mock('../services/requestService', () => ({
  requestService: {
    lister: vi.fn(),
    supprimer: vi.fn(),
  },
}))

import { requestService } from '../services/requestService'
import { useSearchParams } from 'react-router-dom'

const renderPage = (user = mockUser, searchParams = '') => {
  useLang.mockReturnValue(mockLang)
  useAuth.mockReturnValue({ user, estConnecte: true })
  useSearchParams.mockReturnValue([new URLSearchParams(searchParams), vi.fn()])

  return render(
    <MemoryRouter initialEntries={[`/my-requests${searchParams ? '?' + searchParams : ''}`]}>
      <MyRequestsPage />
    </MemoryRouter>
  )
}

describe('MyRequestsPage — état de chargement', () => {
  it('affiche le spinner pendant le chargement', () => {
    requestService.lister.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByText('Chargement des demandes…')).toBeInTheDocument()
  })
})

describe('MyRequestsPage — rendu de la liste', () => {
  beforeEach(() => {
    requestService.lister.mockResolvedValue(mockRequests)
  })

  it('affiche le titre de la page', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Mes demandes')).toBeInTheDocument()
    })
  })

  it('affiche le nombre total de résultats', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/2 résultat/i)).toBeInTheDocument()
    })
  })

  it('affiche les titres des demandes', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Problème VPN')).toBeInTheDocument()
      expect(screen.getByText('Accès Moodle')).toBeInTheDocument()
    })
  })

  it('affiche les badges de statut', async () => {
    renderPage()
    await waitFor(() => {
      // "Soumis" appears in both the status filter dropdown and the badge
      expect(screen.getAllByText('Soumis').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('En cours').length).toBeGreaterThanOrEqual(1)
    })
  })
})

describe('MyRequestsPage — recherche', () => {
  beforeEach(() => {
    requestService.lister.mockResolvedValue(mockRequests)
  })

  it('filtre les demandes selon la saisie de recherche', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => screen.getByText('Problème VPN'))

    await user.type(screen.getByPlaceholderText('Rechercher par titre…'), 'VPN')

    await waitFor(() => {
      expect(screen.getByText('Problème VPN')).toBeInTheDocument()
      expect(screen.queryByText('Accès Moodle')).not.toBeInTheDocument()
    })
  })

  it('affiche "Aucune demande" quand la recherche ne correspond à rien', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => screen.getByText('Problème VPN'))

    await user.type(screen.getByPlaceholderText('Rechercher par titre…'), 'xyzabc123')

    await waitFor(() => {
      expect(screen.getByText('Aucune demande trouvée')).toBeInTheDocument()
    })
  })
})

describe('MyRequestsPage — état vide', () => {
  it('affiche le message vide quand il n\'y a aucune demande', async () => {
    requestService.lister.mockResolvedValue([])
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Aucune demande trouvée')).toBeInTheDocument()
      expect(screen.getByText('Créer ma première demande')).toBeInTheDocument()
    })
  })
})

describe('MyRequestsPage — rendu selon le rôle', () => {
  beforeEach(() => {
    requestService.lister.mockResolvedValue(mockRequests)
  })

  it("affiche 'Mes demandes' pour un utilisateur", async () => {
    renderPage(mockUser)
    await waitFor(() => {
      expect(screen.getByText('Mes demandes')).toBeInTheDocument()
    })
  })

  it("affiche 'Toutes les demandes' pour un gestionnaire", async () => {
    renderPage(mockManager)
    await waitFor(() => {
      expect(screen.getByText('Toutes les demandes')).toBeInTheDocument()
    })
  })
})

describe('MyRequestsPage — actions sur les cartes', () => {
  beforeEach(() => {
    requestService.lister.mockResolvedValue(mockRequests)
  })

  it('affiche le bouton Voir sur chaque demande', async () => {
    renderPage()
    await waitFor(() => {
      // Buttons render with emoji prefix: "👁 Voir"
      const viewButtons = screen.getAllByText(/Voir/)
      expect(viewButtons.length).toBe(2)
    })
  })

  it('affiche le bouton Modifier uniquement pour les demandes SUBMITTED du propriétaire', async () => {
    renderPage(mockUser)
    await waitFor(() => {
      // Only request #1 is SUBMITTED and belongs to mockUser; button renders "✏ Modifier"
      const editButtons = screen.getAllByText(/Modifier/)
      expect(editButtons.length).toBe(1)
    })
  })

  it('n\'affiche pas le bouton Modifier pour les demandes IN_PROGRESS', async () => {
    requestService.lister.mockResolvedValue([mockRequests[1]]) // IN_PROGRESS only
    renderPage(mockUser)

    await waitFor(() => {
      expect(screen.queryByText(/Modifier/)).not.toBeInTheDocument()
    })
  })
})
