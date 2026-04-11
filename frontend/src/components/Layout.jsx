import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useLang } from '../context/LanguageContext'
import './Layout.css'

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

const Layout = ({ children }) => {
  const location = useLocation()
  const { t } = useLang()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isAuthRoute = AUTH_ROUTES.includes(location.pathname) || location.pathname.startsWith('/reset-password')
  const isAuthenticated = !!localStorage.getItem('uqo_token')
  const showSidebar = isAuthenticated && !isAuthRoute

  /* Auth pages — full-screen, no shell */
  if (isAuthRoute) return <>{children}</>

  /* Public pages — topbar only, no sidebar */
  if (!showSidebar) {
    return (
      <div className="public-layout">
        <Navbar isAuthenticated={false} onMobileToggle={() => {}} />
        <div className="public-content">{children}</div>
        <footer className="app-footer app-footer--public">
          <div className="footer-inner">
            <FooterBrand />
            <FooterCols t={t} />
          </div>
          <div className="footer-bottom">{t.footer.rights}</div>
        </footer>
      </div>
    )
  }

  /* Authenticated app shell */
  return (
    <div className="app-shell">
      <Navbar
        isAuthenticated={true}
        onMobileToggle={() => setMobileSidebarOpen(p => !p)}
      />

      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="app-body">
        <main className="app-page-content">{children}</main>
      </div>

      <footer className="app-footer">
        <div className="footer-inner">
          <FooterBrand />
          <FooterCols t={t} />
        </div>
        <div className="footer-bottom">{t.footer.rights}</div>
      </footer>
    </div>
  )
}

/* ── Shared footer sub-components ────────────────────────── */
const FooterBrand = () => (
  <div className="footer-brand">
    <div className="footer-brand-name">UQO Requests</div>
    <div className="footer-brand-tagline">Université du Québec en Outaouais</div>
  </div>
)

const FooterCols = ({ t }) => (
  <>
    <div className="footer-col">
      <h5>{t.footer.gatineau}</h5>
      <p>283, boulevard Alexandre-Taché</p>
      <p>Gatineau (Québec) J8X 3X7</p>
      <p><strong>Tél :</strong> 819 595-3900</p>
      <p><strong>Sans frais :</strong> 1 800 567-1283</p>
    </div>
    <div className="footer-col">
      <h5>{t.footer.saintJerome}</h5>
      <p>5, rue Saint-Joseph</p>
      <p>Saint-Jérôme (Québec) J7Z 0B7</p>
      <p><strong>Tél :</strong> 450 530-7616</p>
      <p><strong>Sans frais :</strong> 1 800 567-1283</p>
    </div>
  </>
)

export default Layout
