/**
 * Shared test utilities
 * Provides renderWithRouter() and mock objects reused across all test files.
 */
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ── Minimal French translations covering every component under test ──
export const mockT = {
  appName: 'UQO Requests',
  nav: {
    dashboard: 'Tableau de bord', newRequest: 'Nouvelle demande',
    notifications: 'Notifications', myRequests: 'Mes demandes',
    allRequests: 'Toutes les demandes', logout: 'Se déconnecter',
    login: 'Se connecter', register: "S'inscrire", home: 'Accueil',
  },
  auth: {
    loginTitle: 'Connexion', loginSubtitle: 'Accédez à votre espace personnel',
    emailLabel: 'Adresse email', emailPlaceholder: 'jean.dupont@uqo.ca',
    passwordLabel: 'Mot de passe', passwordPlaceholder: '••••••••',
    confirmPasswordLabel: 'Confirmer le mot de passe',
    fullNameLabel: 'Nom complet', fullNamePlaceholder: 'Jean Dupont',
    codeLabel: 'Code de vérification', codePlaceholder: '123456',
    codeInfo: 'Un code à 6 chiffres a été envoyé.',
    next: 'Continuer', back: 'Retour', submit: 'Se connecter',
    submitRegister: "S'inscrire", verify: 'Vérifier le code',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: 'Pas encore de compte ?', hasAccount: 'Déjà un compte ?',
    signUp: "S'inscrire", signIn: 'Se connecter',
    passwordHint: 'Minimum 8 caractères, 1 majuscule, 1 chiffre',
    show: 'Afficher', hide: 'Masquer',
    step1: 'Email', step2: 'Mot de passe', step3: 'Vérification',
    leftTitle: 'Plateforme UQO', leftSubtitle: '',
    leftPoint1: '', leftPoint2: '', leftPoint3: '',
  },
  dashboard: {
    title: 'Tableau de bord', managerTitle: 'Gestion des demandes',
    subtitle: 'Bienvenue', managerSubtitle: "Vue d'ensemble",
    newRequest: 'Nouvelle demande',
    total: 'Total', submitted: 'Soumis', inProgress: 'En cours',
    resolved: 'Résolu', closed: 'Fermé',
    loading: 'Chargement...', error: 'Impossible de charger les données.',
    colTitle: 'Titre', colCategory: 'Catégorie', colStatus: 'Statut',
    colDate: 'Date', colCreatedBy: 'Créé par',
    statusChart: 'Répartition par statut',
    recentRequests: 'Demandes récentes', recentActivity: 'Activité récente',
    recentNotifications: 'Notifications récentes',
    viewAll: 'Voir tout', noActivity: 'Aucune activité récente',
    noRecentRequests: 'Aucune demande pour le moment',
    goodMorning: 'Bonjour', goodAfternoon: 'Bon après-midi', goodEvening: 'Bonsoir',
  },
  myRequests: {
    title: 'Mes demandes', managerTitle: 'Toutes les demandes',
    subtitle: 'Gérez vos demandes', managerSubtitle: 'Supervisez toutes les demandes',
    searchPlaceholder: 'Rechercher par titre…',
    filterAll: 'Tous les statuts', filterType: 'Toutes les catégories',
    sortDateDesc: 'Plus récentes', sortDateAsc: 'Plus anciennes',
    sortStatus: 'Statut', sortTitle: 'Titre A–Z',
    results: 'résultat(s)', page: 'Page', of: 'sur',
    prev: '← Précédent', next: 'Suivant →',
    noResults: 'Aucune demande trouvée',
    noResultsHint: 'Modifiez vos filtres.',
    noResultsHintManager: 'Aucune demande.',
    createFirst: 'Créer ma première demande',
    unreadMsg: 'non lu(s)',
    view: 'Voir', edit: 'Modifier', delete: 'Supprimer',
    confirmDelete: 'Supprimer cette demande ?', cancelDelete: 'Annuler',
    loading: 'Chargement des demandes…',
  },
  request: {
    backToDashboard: 'Tableau de bord',
    loading: 'Chargement...', notFound: 'Demande introuvable',
  },
  status: { SUBMITTED: 'Soumis', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu', CLOSED: 'Fermé' },
  common: {
    loading: 'Chargement...', error: 'Une erreur est survenue.',
    cancel: 'Annuler', save: 'Enregistrer', close: 'Fermer',
    back: 'Retour', next: 'Suivant', edit: 'Modifier', search: 'Rechercher',
  },
  form: {
    createTitle: 'Créer une nouvelle demande',
    createSubtitle: 'Remplissez le formulaire',
    titleLabel: 'Titre de la demande', titlePlaceholder: 'Ex : Problème VPN',
    typeLabel: 'Type de demande', typeDefault: '-- Sélectionnez un type --',
    descriptionLabel: 'Description détaillée',
    descriptionPlaceholder: 'Décrivez en détail...',
    chars: 'caractères', required: 'requis',
    submitCreate: 'Créer la demande', submitEdit: 'Enregistrer',
    tipsTitle: 'Conseils', tip1: '', tip2: '', tip3: '', tip4: '', tip5: '',
    loadingRequest: 'Chargement...', notEditable: 'Modification impossible.',
  },
  notifications: {
    title: 'Notifications', subtitle: '', markAllRead: 'Tout lire',
    empty: 'Aucune notification', emptyHint: '',
    loading: 'Chargement...', newMessage: 'Nouveau message',
  },
  footer: { rights: '© 2026 UQO Requests', gatineau: 'Campus Gatineau', saintJerome: 'Campus Saint-Jérôme' },
}

export const mockLang = { t: mockT, lang: 'fr', toggleLang: vi.fn(), isFr: true }

// ── Standard user fixtures ──
export const mockUser = { id: 1, nom_complet: 'Étudiant Test', email: 'etudiant@uqo.ca', role: 'utilisateur' }
export const mockManager = { id: 2, nom_complet: 'Gestionnaire Test', email: 'gestionnaire@uqo.ca', role: 'gestionnaire' }

// ── Sample requests ──
export const mockRequests = [
  {
    id: 1, titre: 'Problème VPN', description: 'Je ne peux pas me connecter.',
    type: 'Technique', statut: 'SUBMITTED',
    createur: mockUser, createur_id: 1,
    date_creation: '2026-03-01T10:00:00Z', date_modification: '2026-03-02T10:00:00Z',
    commentaires: [], historique: [],
  },
  {
    id: 2, titre: 'Accès Moodle', description: 'Erreur 403.',
    type: 'Bug', statut: 'IN_PROGRESS',
    createur: mockUser, createur_id: 1,
    date_creation: '2026-03-03T10:00:00Z', date_modification: '2026-03-04T10:00:00Z',
    commentaires: [
      { id: 10, contenu: 'En cours de traitement.', auteur: mockManager, date_creation: '2026-03-04T11:00:00Z' },
    ],
    historique: [],
  },
]

/**
 * Wraps a component in a MemoryRouter for testing.
 * @param {React.ReactElement} ui
 * @param {{ initialEntries?: string[] }} options
 */
export function renderWithRouter(ui, { initialEntries = ['/'] } = {}) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>)
}
