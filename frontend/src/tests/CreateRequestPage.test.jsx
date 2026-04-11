/**
 * Tests : CreateRequestPage
 * Vérifie le rendu du formulaire, la validation des champs et l'état du bouton.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CreateRequestPage from '../pages/CreateRequestPage'
import { useLang } from '../context/LanguageContext'
import { mockLang } from './utils'

vi.mock('../context/LanguageContext')
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: vi.fn(() => vi.fn()) }
})
vi.mock('../services/requestService', () => ({
  requestService: { creer: vi.fn() },
}))

const renderPage = () => {
  useLang.mockReturnValue(mockLang)
  return render(
    <MemoryRouter>
      <CreateRequestPage />
    </MemoryRouter>
  )
}

describe('CreateRequestPage — rendu', () => {
  it('affiche le titre du formulaire', () => {
    renderPage()
    expect(screen.getByText('Créer une nouvelle demande')).toBeInTheDocument()
  })

  it('affiche le champ Titre', () => {
    renderPage()
    expect(screen.getByLabelText(/Titre de la demande/i)).toBeInTheDocument()
  })

  it('affiche le sélecteur de type', () => {
    renderPage()
    expect(screen.getByLabelText(/Type de demande/i)).toBeInTheDocument()
  })

  it('affiche le champ Description', () => {
    renderPage()
    expect(screen.getByLabelText(/Description détaillée/i)).toBeInTheDocument()
  })

  it('le bouton Créer est désactivé si le formulaire est vide', () => {
    renderPage()
    expect(screen.getByText('Créer la demande')).toBeDisabled()
  })
})

describe('CreateRequestPage — validation des champs', () => {
  it('affiche une erreur si le titre est trop court', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/Titre de la demande/i), 'AB')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/Min\./i)).toBeInTheDocument()
    })
  })

  it('le compteur de caractères du titre se met à jour', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/Titre de la demande/i), 'Hello')
    expect(screen.getByText(/5 \//)).toBeInTheDocument()
  })

  it('le bouton est activé avec un formulaire valide', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/Titre de la demande/i), 'Problème de connexion au VPN universitaire')
    await user.selectOptions(screen.getByLabelText(/Type de demande/i), 'Technique')
    await user.type(
      screen.getByLabelText(/Description détaillée/i),
      "Je ne parviens pas à me connecter au VPN depuis ce matin. Le message affiché est : timeout."
    )

    await waitFor(() => {
      expect(screen.getByText('Créer la demande')).not.toBeDisabled()
    })
  })
})

describe('CreateRequestPage — options de type', () => {
  it('affiche toutes les catégories de demandes', () => {
    renderPage()
    const select = screen.getByLabelText(/Type de demande/i)
    const options = Array.from(select.options).map(o => o.text)

    expect(options).toContain('Technique')
    expect(options).toContain('Bug')
    expect(options).toContain('Question')
  })

  it('affiche le placeholder de sélection par défaut', () => {
    renderPage()
    expect(screen.getByText('-- Sélectionnez un type --')).toBeInTheDocument()
  })
})
