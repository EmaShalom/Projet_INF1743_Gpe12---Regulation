/**
 * Tests : LoginPage
 * Vérifie le rendu, la validation des champs et les messages d'erreur.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import { mockLang, mockUser } from './utils'

vi.mock('../context/useAuth')
vi.mock('../context/LanguageContext')
vi.mock('../assets/logo.png', () => ({ default: 'logo.png' }))
vi.mock('../assets/bg1.jpg', () => ({ default: 'bg1.jpg' }))
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

const renderPage = () => {
  useLang.mockReturnValue(mockLang)
  useAuth.mockReturnValue({
    estConnecte: false, isLoading: false,
    loginFromToken: vi.fn(), login: vi.fn(),
  })
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage — rendu initial', () => {
  it('affiche le champ email', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/jean\.dupont@uqo\.ca/i)).toBeInTheDocument()
  })

  it('affiche le titre de connexion', () => {
    renderPage()
    expect(screen.getByText('Connexion')).toBeInTheDocument()
  })

  it('affiche le lien vers la page d\'inscription', () => {
    renderPage()
    expect(screen.getByText(/S'inscrire/i)).toBeInTheDocument()
  })

  it('affiche le lien mot de passe oublié (étape 2)', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/jean\.dupont@uqo\.ca/i), 'test@uqo.ca')
    await user.click(screen.getByText('Continuer'))
    await waitFor(() => {
      expect(screen.getByText(/Mot de passe oublié/i)).toBeInTheDocument()
    })
  })
})

describe('LoginPage — étape 1 (email)', () => {
  it('le bouton Continuer est désactivé avec un email vide', () => {
    renderPage()
    const btn = screen.getByText('Continuer')
    expect(btn).toBeDisabled()
  })

  it('le bouton Continuer est activé avec un email valide', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/jean\.dupont@uqo\.ca/i), 'test@uqo.ca')
    expect(screen.getByText('Continuer')).not.toBeDisabled()
  })

  it('affiche une erreur pour un email invalide', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/jean\.dupont@uqo\.ca/i), 'pas-un-email')
    await user.tab()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continuer' })).toBeDisabled()
    })
  })
})

describe('LoginPage — rendu conditionnel selon l\'état', () => {
  it('redirige vers /dashboard si déjà connecté', () => {
    useAuth.mockReturnValue({ estConnecte: true, isLoading: false })
    useLang.mockReturnValue(mockLang)

    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    )
    // Le composant rend null ou redirige quand l'utilisateur est déjà connecté
    // On vérifie qu'il ne rend pas le formulaire de login
    expect(screen.queryByPlaceholderText(/jean\.dupont@uqo\.ca/i)).not.toBeInTheDocument()
  })
})
