import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser, FaKey, FaQuestionCircle, FaIdCard,
  FaEdit, FaSave, FaTimes, FaShieldAlt, FaSignOutAlt,
  FaEnvelope, FaCalendarAlt, FaDesktop, FaChevronDown, FaChevronUp,
  FaExternalLinkAlt, FaPhone, FaLock, FaUnlock,
} from 'react-icons/fa'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import api from '../services/api'
import './SettingsPage.css'

/* ─── helpers ─────────────────────────────────────────────── */
const initials = (name) => (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const roleLabel = (role, lang) => {
  if (role === 'gestionnaire') return lang === 'fr' ? 'Gestionnaire' : 'Manager'
  if (role === 'admin')        return lang === 'fr' ? 'Administrateur' : 'Admin'
  return lang === 'fr' ? 'Étudiant·e' : 'Student'
}

const roleBadgeCls = (role) => ({
  gestionnaire: 'set-role-manager',
  admin: 'set-role-admin',
}[role] || 'set-role-student')

/* ─── FAQ data ────────────────────────────────────────────── */
const FAQ = [
  {
    q_fr: 'Comment soumettre une nouvelle demande ?',
    a_fr: 'Cliquez sur « Nouvelle demande » dans la barre de navigation ou depuis votre tableau de bord. Remplissez le formulaire, choisissez un type de demande, et soumettez.',
    q_en: 'How do I submit a new request?',
    a_en: 'Click "New Request" in the navigation bar or from your dashboard. Fill out the form, choose a request type, and submit.',
  },
  {
    q_fr: 'Comment suivre l\'état de ma demande ?',
    a_fr: 'Rendez-vous dans « Mes demandes ». Chaque demande affiche son statut en temps réel : Soumis, En cours, Résolu ou Fermé.',
    q_en: 'How can I track my request status?',
    a_en: 'Go to "My Requests". Each request displays its real-time status: Submitted, In Progress, Resolved, or Closed.',
  },
  {
    q_fr: 'Puis-je modifier une demande après soumission ?',
    a_fr: 'Oui, mais uniquement si le statut est encore « Soumis ». Une fois la demande en cours de traitement, la modification n\'est plus possible.',
    q_en: 'Can I edit a request after submitting it?',
    a_en: 'Yes, but only while the status is "Submitted". Once the request is being processed, editing is no longer possible.',
  },
  {
    q_fr: 'Comment contacter mon gestionnaire ?',
    a_fr: 'Ouvrez votre demande et utilisez la section « Conversation ». Votre gestionnaire sera notifié automatiquement.',
    q_en: 'How do I contact my manager?',
    a_en: 'Open your request and use the "Conversation" section. Your manager will be notified automatically.',
  },
  {
    q_fr: 'Que faire si je n\'ai pas reçu le code de vérification ?',
    a_fr: 'Vérifiez vos courriers indésirables. Si le problème persiste, attendez 2 minutes et réessayez via « Mot de passe oublié ».',
    q_en: 'What if I didn\'t receive the verification code?',
    a_en: 'Check your spam folder. If the issue persists, wait 2 minutes and try again via "Forgot Password".',
  },
]

/* ─── Sub-components ──────────────────────────────────────── */

/* Avatar with letter */
const Avatar = ({ name, size = 88 }) => (
  <div className="set-avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
    {initials(name)}
  </div>
)

/* Section card wrapper */
const Card = ({ title, icon, children, className = '' }) => (
  <div className={`set-card ${className}`}>
    <div className="set-card-header">
      <span className="set-card-icon">{icon}</span>
      <h2 className="set-card-title">{title}</h2>
    </div>
    <div className="set-card-body">{children}</div>
  </div>
)

/* Read-only info row */
const InfoRow = ({ label, value, icon }) => (
  <div className="set-info-row">
    <div className="set-info-label">
      {icon && <span className="set-info-icon">{icon}</span>}
      {label}
    </div>
    <div className="set-info-value">{value || '—'}</div>
  </div>
)

/* Accordion FAQ item */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(p => !p)}>
        <span>{q}</span>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────── */
const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile')

  /* ─ Profile edit state ─ */
  const [editing, setEditing] = useState(false)
  const [profileDraft, setProfileDraft] = useState({
    prenom: user?.nom_complet?.split(' ')[0] || '',
    nom:    user?.nom_complet?.split(' ').slice(1).join(' ') || '',
    departement: user?.departement || '',
    matricule: user?.matricule || (user?.id ? `UQO-${String(user.id).padStart(6, '0')}` : ''),
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')

  /* ─ Password state ─ */
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwShow, setPwShow] = useState({ current: false, new: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  /* ─ Logout all ─ */
  const [logoutAllLoading, setLogoutAllLoading] = useState(false)

  /* Computed */
  const fullName = `${profileDraft.prenom} ${profileDraft.nom}`.trim() || user?.nom_complet || '—'
  const joinDate = useMemo(() => {
    const d = user?.date_inscription ? new Date(user.date_inscription) : null
    if (!d) return lang === 'fr' ? 'Non renseigné' : 'Not available'
    return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  }, [user, lang])

  const today = useMemo(() => new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }), [lang])

  /* ─ Handlers ─ */
  const handleProfileSave = async () => {
    setProfileSaving(true); setProfileSuccess('')
    try {
      const newName = `${profileDraft.prenom} ${profileDraft.nom}`.trim()
      updateUser({ nom_complet: newName, departement: profileDraft.departement, matricule: profileDraft.matricule })
      setProfileSuccess(lang === 'fr' ? 'Profil mis à jour avec succès.' : 'Profile updated successfully.')
      setEditing(false)
      setTimeout(() => setProfileSuccess(''), 4000)
    } catch {
      // silent
    } finally { setProfileSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError(''); setPwSuccess('')
    if (pwForm.new.length < 8) { setPwError(lang === 'fr' ? 'Minimum 8 caractères.' : 'Minimum 8 characters.'); return }
    if (pwForm.new !== pwForm.confirm) { setPwError(lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.'); return }
    setPwLoading(true)
    try {
      await api.post('/auth/change-password/', { current_password: pwForm.current, new_password: pwForm.new })
      setPwSuccess(lang === 'fr' ? 'Mot de passe modifié avec succès.' : 'Password changed successfully.')
      setPwForm({ current: '', new: '', confirm: '' })
      setTimeout(() => setPwSuccess(''), 5000)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail
      setPwError(msg || (lang === 'fr' ? 'Impossible de modifier le mot de passe.' : 'Could not change password.'))
    } finally { setPwLoading(false) }
  }

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true)
    try { await api.post('/auth/logout-all/') } catch { /* silent */ }
    logout()
    navigate('/login')
  }

  const TABS = [
    { id: 'profile',  label: lang === 'fr' ? 'Profil'    : 'Profile',  icon: <FaUser /> },
    { id: 'account',  label: lang === 'fr' ? 'Compte'    : 'Account',  icon: <FaIdCard /> },
    { id: 'security', label: lang === 'fr' ? 'Sécurité'  : 'Security', icon: <FaShieldAlt /> },
    { id: 'support',  label: lang === 'fr' ? 'Support'   : 'Support',  icon: <FaQuestionCircle /> },
  ]

  return (
    <div className="set-page">

      {/* ── Page header ── */}
      <div className="set-page-header">
        <div>
          <h1 className="set-page-title">
            {lang === 'fr' ? 'Paramètres' : 'Settings'}
          </h1>
          <p className="set-page-subtitle">
            {lang === 'fr'
              ? 'Gérez votre profil, votre compte et vos préférences de sécurité'
              : 'Manage your profile, account and security preferences'}
          </p>
        </div>
      </div>

      <div className="set-layout">

        {/* ── Left tab nav ── */}
        <nav className="set-tabnav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`set-tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="set-tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Right content ── */}
        <div className="set-content">

          {/* ══════════════ PROFILE ══════════════ */}
          {activeTab === 'profile' && (
            <div className="set-section">
              <Card
                title={lang === 'fr' ? 'Informations personnelles' : 'Personal Information'}
                icon={<FaUser />}
              >
                {/* Avatar + name heading */}
                <div className="set-profile-top">
                  <div className="set-avatar-wrap">
                    <Avatar name={fullName} />
                    <button className="set-avatar-change" title={lang === 'fr' ? 'Changer la photo' : 'Change photo'}>
                      <FaEdit />
                    </button>
                  </div>
                  <div className="set-profile-id">
                    <div className="set-profile-name">{fullName}</div>
                    <span className={`set-role-badge ${roleBadgeCls(user?.role)}`}>
                      {roleLabel(user?.role, lang)}
                    </span>
                    {!editing && (
                      <button className="set-edit-btn" onClick={() => setEditing(true)}>
                        <FaEdit /> {lang === 'fr' ? 'Modifier' : 'Edit'}
                      </button>
                    )}
                  </div>
                </div>

                {profileSuccess && <div className="set-alert-success">✓ {profileSuccess}</div>}

                {/* Edit form OR read-only rows */}
                {editing ? (
                  <div className="set-edit-form">
                    <div className="set-form-row">
                      <div className="set-field">
                        <label className="set-label">{lang === 'fr' ? 'Prénom' : 'First name'}</label>
                        <input
                          className="set-input"
                          value={profileDraft.prenom}
                          onChange={e => setProfileDraft(p => ({ ...p, prenom: e.target.value }))}
                          placeholder={lang === 'fr' ? 'Prénom' : 'First name'}
                        />
                      </div>
                      <div className="set-field">
                        <label className="set-label">{lang === 'fr' ? 'Nom de famille' : 'Last name'}</label>
                        <input
                          className="set-input"
                          value={profileDraft.nom}
                          onChange={e => setProfileDraft(p => ({ ...p, nom: e.target.value }))}
                          placeholder={lang === 'fr' ? 'Nom' : 'Last name'}
                        />
                      </div>
                    </div>
                    <div className="set-field">
                      <label className="set-label">{lang === 'fr' ? 'Département / Faculté' : 'Department / Faculty'}</label>
                      <input
                        className="set-input"
                        value={profileDraft.departement}
                        onChange={e => setProfileDraft(p => ({ ...p, departement: e.target.value }))}
                        placeholder={lang === 'fr' ? 'Ex : Sciences informatiques' : 'e.g. Computer Science'}
                      />
                    </div>
                    <div className="set-field">
                      <label className="set-label">{lang === 'fr' ? 'Numéro étudiant / matricule' : 'Student ID / Matricule'}</label>
                      <input
                        className="set-input"
                        value={profileDraft.matricule}
                        onChange={e => setProfileDraft(p => ({ ...p, matricule: e.target.value }))}
                        placeholder="UQO-000000"
                      />
                    </div>
                    <div className="set-form-actions">
                      <button className="set-btn-cancel" onClick={() => setEditing(false)} disabled={profileSaving}>
                        <FaTimes /> {lang === 'fr' ? 'Annuler' : 'Cancel'}
                      </button>
                      <button className="set-btn-save" onClick={handleProfileSave} disabled={profileSaving}>
                        {profileSaving ? <span className="spinner" /> : <FaSave />}
                        {lang === 'fr' ? 'Enregistrer' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="set-info-list">
                    <InfoRow label={lang === 'fr' ? 'Prénom' : 'First name'} value={profileDraft.prenom} icon={<FaUser />} />
                    <InfoRow label={lang === 'fr' ? 'Nom de famille' : 'Last name'} value={profileDraft.nom} icon={<FaUser />} />
                    <InfoRow label={lang === 'fr' ? 'Email institutionnel' : 'Institutional email'} value={user?.email} icon={<FaEnvelope />} />
                    <InfoRow label={lang === 'fr' ? 'Rôle' : 'Role'} value={roleLabel(user?.role, lang)} icon={<FaShieldAlt />} />
                    <InfoRow label={lang === 'fr' ? 'Département / Faculté' : 'Department / Faculty'} value={profileDraft.departement || (lang === 'fr' ? 'Non renseigné' : 'Not provided')} icon={<FaIdCard />} />
                    <InfoRow label={lang === 'fr' ? 'Numéro étudiant' : 'Student ID'} value={profileDraft.matricule} icon={<FaIdCard />} />
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ══════════════ ACCOUNT ══════════════ */}
          {activeTab === 'account' && (
            <div className="set-section">
              <Card
                title={lang === 'fr' ? 'Informations du compte' : 'Account Information'}
                icon={<FaIdCard />}
              >
                <div className="set-info-list">
                  <InfoRow
                    label={lang === 'fr' ? 'Nom d\'utilisateur' : 'Username'}
                    value={user?.nom_complet}
                    icon={<FaUser />}
                  />
                  <InfoRow
                    label={lang === 'fr' ? 'Adresse email (connexion)' : 'Email address (login)'}
                    value={user?.email}
                    icon={<FaEnvelope />}
                  />
                  <InfoRow
                    label={lang === 'fr' ? 'Identifiant interne' : 'Internal ID'}
                    value={user?.id ? `#${user.id}` : '—'}
                    icon={<FaIdCard />}
                  />
                  <InfoRow
                    label={lang === 'fr' ? 'Compte créé le' : 'Account created'}
                    value={joinDate}
                    icon={<FaCalendarAlt />}
                  />
                  <InfoRow
                    label={lang === 'fr' ? 'Dernière connexion' : 'Last login'}
                    value={today}
                    icon={<FaCalendarAlt />}
                  />
                  <InfoRow
                    label={lang === 'fr' ? 'Type de compte' : 'Account type'}
                    value={roleLabel(user?.role, lang)}
                    icon={<FaShieldAlt />}
                  />
                </div>
              </Card>

              {/* Danger zone */}
              <Card
                title={lang === 'fr' ? 'Zone sensible' : 'Danger Zone'}
                icon={<FaShieldAlt />}
                className="set-card-danger"
              >
                <p className="set-danger-desc">
                  {lang === 'fr'
                    ? 'Les actions ci-dessous sont irréversibles. Procédez avec prudence.'
                    : 'The actions below are irreversible. Proceed with caution.'}
                </p>
                <button
                  className="set-btn-danger"
                  onClick={() => { logout(); navigate('/login') }}
                >
                  <FaSignOutAlt />
                  {lang === 'fr' ? 'Se déconnecter' : 'Sign out'}
                </button>
              </Card>
            </div>
          )}

          {/* ══════════════ SECURITY ══════════════ */}
          {activeTab === 'security' && (
            <div className="set-section">

              {/* Change password */}
              <Card
                title={lang === 'fr' ? 'Modifier le mot de passe' : 'Change Password'}
                icon={<FaKey />}
              >
                <form onSubmit={handlePasswordChange} className="set-pw-form">
                  {pwError   && <div className="set-alert-error">⚠ {pwError}</div>}
                  {pwSuccess && <div className="set-alert-success">✓ {pwSuccess}</div>}

                  {[
                    { key: 'current', label: lang === 'fr' ? 'Mot de passe actuel' : 'Current password' },
                    { key: 'new',     label: lang === 'fr' ? 'Nouveau mot de passe' : 'New password' },
                    { key: 'confirm', label: lang === 'fr' ? 'Confirmer le nouveau mot de passe' : 'Confirm new password' },
                  ].map(({ key, label }) => (
                    <div className="set-field" key={key}>
                      <label className="set-label">{label}</label>
                      <div className="set-input-wrap">
                        <input
                          type={pwShow[key] ? 'text' : 'password'}
                          className="set-input"
                          value={pwForm[key]}
                          onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                          placeholder="••••••••"
                          autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                        />
                        <button
                          type="button"
                          className="set-pw-toggle"
                          onClick={() => setPwShow(p => ({ ...p, [key]: !p[key] }))}
                        >
                          {pwShow[key] ? <FaUnlock /> : <FaLock />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="set-pw-hint">
                    {lang === 'fr'
                      ? 'Minimum 8 caractères, 1 majuscule, 1 chiffre.'
                      : 'Minimum 8 characters, 1 uppercase, 1 number.'}
                  </div>

                  <button
                    type="submit"
                    className="set-btn-save"
                    disabled={!pwForm.current || !pwForm.new || !pwForm.confirm || pwLoading}
                  >
                    {pwLoading ? <span className="spinner" /> : <FaKey />}
                    {lang === 'fr' ? 'Modifier le mot de passe' : 'Change password'}
                  </button>
                </form>
              </Card>

              {/* Active sessions */}
              <Card
                title={lang === 'fr' ? 'Sessions actives' : 'Active Sessions'}
                icon={<FaDesktop />}
              >
                <div className="set-session-item set-session-current">
                  <div className="set-session-icon"><FaDesktop /></div>
                  <div className="set-session-info">
                    <div className="set-session-device">
                      {navigator.platform || (lang === 'fr' ? 'Navigateur web' : 'Web browser')}
                    </div>
                    <div className="set-session-meta">
                      {lang === 'fr' ? 'Session actuelle' : 'Current session'} · {today}
                    </div>
                  </div>
                  <span className="set-session-badge">
                    {lang === 'fr' ? 'En cours' : 'Active'}
                  </span>
                </div>
              </Card>

              {/* 2FA placeholder */}
              <Card
                title={lang === 'fr' ? 'Double authentification (2FA)' : 'Two-Factor Authentication (2FA)'}
                icon={<FaShieldAlt />}
              >
                <div className="set-2fa-block">
                  <div className="set-2fa-icon">🛡️</div>
                  <div className="set-2fa-text">
                    <div className="set-2fa-title">
                      {lang === 'fr' ? 'Authentification à deux facteurs' : 'Two-Factor Authentication'}
                    </div>
                    <div className="set-2fa-desc">
                      {lang === 'fr'
                        ? 'La 2FA est intégrée au processus de connexion de la plateforme UQO (code envoyé par email). Aucune configuration supplémentaire n\'est requise.'
                        : 'UQO platform login already uses 2FA (email verification code). No additional setup required.'}
                    </div>
                  </div>
                  <span className="set-2fa-badge">
                    {lang === 'fr' ? 'Actif' : 'Active'}
                  </span>
                </div>
              </Card>

              {/* Logout all devices */}
              <Card
                title={lang === 'fr' ? 'Déconnexion globale' : 'Sign Out Everywhere'}
                icon={<FaSignOutAlt />}
                className="set-card-danger"
              >
                <p className="set-danger-desc">
                  {lang === 'fr'
                    ? 'Cette action vous déconnecte de tous les appareils et sessions actives. Vous devrez vous reconnecter.'
                    : 'This action signs you out of all devices and active sessions. You will need to sign in again.'}
                </p>
                <button
                  className="set-btn-danger"
                  onClick={handleLogoutAll}
                  disabled={logoutAllLoading}
                >
                  {logoutAllLoading ? <span className="spinner" /> : <FaSignOutAlt />}
                  {lang === 'fr' ? 'Se déconnecter de tous les appareils' : 'Sign out of all devices'}
                </button>
              </Card>
            </div>
          )}

          {/* ══════════════ SUPPORT ══════════════ */}
          {activeTab === 'support' && (
            <div className="set-section">

              {/* Contact */}
              <Card
                title={lang === 'fr' ? 'Contacter le support' : 'Contact Support'}
                icon={<FaEnvelope />}
              >
                <div className="set-support-grid">
                  <a href="mailto:support@uqo.ca" className="set-support-card">
                    <div className="set-support-card-icon"><FaEnvelope /></div>
                    <div className="set-support-card-label">Email</div>
                    <div className="set-support-card-value">support@uqo.ca</div>
                    <FaExternalLinkAlt className="set-support-ext" />
                  </a>
                  <a href="tel:+18195953900" className="set-support-card">
                    <div className="set-support-card-icon"><FaPhone /></div>
                    <div className="set-support-card-label">
                      {lang === 'fr' ? 'Téléphone' : 'Phone'}
                    </div>
                    <div className="set-support-card-value">1 800 567-1283</div>
                    <FaExternalLinkAlt className="set-support-ext" />
                  </a>
                  <div className="set-support-card set-support-card-hours">
                    <div className="set-support-card-icon">🕘</div>
                    <div className="set-support-card-label">
                      {lang === 'fr' ? 'Heures d\'ouverture' : 'Office hours'}
                    </div>
                    <div className="set-support-card-value">
                      {lang === 'fr' ? 'Lun – Ven, 9h – 17h' : 'Mon – Fri, 9am – 5pm'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* FAQ */}
              <Card
                title={lang === 'fr' ? 'Foire aux questions' : 'Frequently Asked Questions'}
                icon={<FaQuestionCircle />}
              >
                <div className="set-faq-list">
                  {FAQ.map((item, i) => (
                    <FaqItem
                      key={i}
                      q={lang === 'fr' ? item.q_fr : item.q_en}
                      a={lang === 'fr' ? item.a_fr : item.a_en}
                    />
                  ))}
                </div>
              </Card>

              {/* Legal */}
              <Card
                title={lang === 'fr' ? 'Mentions légales' : 'Legal & Privacy'}
                icon={<FaShieldAlt />}
              >
                <div className="set-legal-links">
                  <a href="#" className="set-legal-link" onClick={e => e.preventDefault()}>
                    <FaExternalLinkAlt />
                    {lang === 'fr' ? 'Conditions d\'utilisation' : 'Terms of Service'}
                  </a>
                  <a href="#" className="set-legal-link" onClick={e => e.preventDefault()}>
                    <FaExternalLinkAlt />
                    {lang === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}
                  </a>
                  <a href="#" className="set-legal-link" onClick={e => e.preventDefault()}>
                    <FaExternalLinkAlt />
                    {lang === 'fr' ? 'Accessibilité' : 'Accessibility'}
                  </a>
                </div>
                <p className="set-legal-note">
                  {lang === 'fr'
                    ? 'UQO Requests est une plateforme académique interne développée dans le cadre du cours INF1743 — Groupe 12.'
                    : 'UQO Requests is an internal academic platform developed as part of course INF1743 — Group 12.'}
                </p>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default SettingsPage
