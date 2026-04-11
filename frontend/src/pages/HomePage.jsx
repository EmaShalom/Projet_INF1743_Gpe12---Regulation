import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/LanguageContext'
import bg1 from '../assets/bg1.jpg'
import './HomePage.css'

const FEATURES = (t) => [
  { icon: '📊', title: t.home.feature1Title, desc: t.home.feature1Desc },
  { icon: '💬', title: t.home.feature2Title, desc: t.home.feature2Desc },
  { icon: '🔔', title: t.home.feature3Title, desc: t.home.feature3Desc },
  { icon: '🔒', title: t.home.feature4Title, desc: t.home.feature4Desc },
]

const PREVIEW_ITEMS = [
  { title: 'Problème accès Moodle', sub: 'Technique', badge: 'preview-badge-submitted', label: 'Soumis' },
  { title: 'Demande de relevé de notes', sub: 'Question', badge: 'preview-badge-progress', label: 'En cours' },
  { title: 'Remboursement frais cours', sub: 'Amélioration', badge: 'preview-badge-resolved', label: 'Résolu' },
]

const HomePage = () => {
  const navigate = useNavigate()
  const { estConnecte, user } = useAuth()
  const { t } = useLang()

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="home-hero">
        <div className="home-hero-bg" style={{ backgroundImage: `url(${bg1})` }} />
        <div className="home-hero-overlay" />

        <div className="home-hero-inner">
          {/* Left: copy */}
          <div>
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              Université du Québec en Outaouais
            </div>

            {estConnecte && user ? (
              <div className="hero-welcome">
                <span className="hero-welcome-dot" />
                {t.home.welcomeBack} <strong style={{ marginLeft: 4 }}>{user.nom_complet?.split(' ')[0]}</strong>
              </div>
            ) : null}

            <h1 className="hero-title">
              {t.home.heroTitle.split(' ').slice(0, 3).join(' ')}{' '}
              <span className="hero-title-accent">{t.home.heroTitle.split(' ').slice(3).join(' ')}</span>
            </h1>

            <p className="hero-subtitle">{t.home.heroSubtitle}</p>

            <div className="hero-actions">
              {!estConnecte ? (
                <>
                  <button className="hero-btn-primary" onClick={() => navigate('/register')}>
                    ✦ {t.home.heroCtaPrimary}
                  </button>
                  <button className="hero-btn-secondary" onClick={() => navigate('/login')}>
                    {t.home.heroCtaSecondary}
                  </button>
                </>
              ) : (
                <>
                  <button className="hero-btn-primary" onClick={() => navigate('/requests/new')}>
                    ✦ {t.home.heroCtaPrimary}
                  </button>
                  <button className="hero-btn-secondary" onClick={() => navigate('/dashboard')}>
                    {t.home.heroCta}
                  </button>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-val">{t.home.stat1Val}</div>
                <div className="hero-stat-label">{t.home.stat1}</div>
              </div>
              <div className="hero-stat-sep" />
              <div className="hero-stat">
                <div className="hero-stat-val">{t.home.stat2Val}</div>
                <div className="hero-stat-label">{t.home.stat2}</div>
              </div>
              <div className="hero-stat-sep" />
              <div className="hero-stat">
                <div className="hero-stat-val">{t.home.stat3Val}</div>
                <div className="hero-stat-label">{t.home.stat3}</div>
              </div>
            </div>
          </div>

          {/* Right: preview card */}
          <div className="hero-card-preview">
            <div className="preview-header-bar">
              <span className="preview-dot preview-dot-r" />
              <span className="preview-dot preview-dot-y" />
              <span className="preview-dot preview-dot-g" />
              <span className="preview-bar-title">UQO Requests — Tableau de bord</span>
            </div>
            <div className="preview-body">
              {PREVIEW_ITEMS.map((item, i) => (
                <div className="preview-item" key={i}>
                  <div>
                    <div className="preview-item-title">{item.title}</div>
                    <div className="preview-item-sub">{item.sub}</div>
                  </div>
                  <span className={`preview-badge ${item.badge}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="home-features">
        <div className="home-features-inner">
          <div className="section-eyebrow">Fonctionnalités</div>
          <h2 className="section-title">Tout ce dont vous avez besoin</h2>
          <p className="section-sub">{t.home.heroSubtitle}</p>
          <div className="features-grid">
            {FEATURES(t).map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="home-how">
        <div className="home-how-inner">
          <div className="section-eyebrow">{t.home.howItWorks}</div>
          <h2 className="section-title">{t.home.howItWorks}</h2>
          <p className="section-sub" style={{ marginBottom: 'var(--space-16)' }}>
            En 3 étapes simples, gérez toutes vos requêtes universitaires.
          </p>
          <div className="steps-grid">
            {[
              { n: 1, title: t.home.step1Title, desc: t.home.step1Desc },
              { n: 2, title: t.home.step2Title, desc: t.home.step2Desc },
              { n: 3, title: t.home.step3Title, desc: t.home.step3Desc },
            ].map(s => (
              <div className="step-card" key={s.n}>
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      {!estConnecte && (
        <section className="home-cta">
          <div className="home-cta-inner">
            <h2>{t.home.ctaTitle}</h2>
            <p>{t.home.ctaSubtitle}</p>
            <button className="home-cta-btn" onClick={() => navigate('/register')}>
              {t.home.ctaBtn} →
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
