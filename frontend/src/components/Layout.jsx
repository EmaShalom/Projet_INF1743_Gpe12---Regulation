import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import './Layout.css'

// 🔥 Images background
import bg1 from '../assets/bg1.jpg'
import bg2 from '../assets/bg2.jpg'
import bg3 from '../assets/bg3.jpg'
import bg4 from '../assets/bg4.jpg'

const Layout = ({ children }) => {
  const location = useLocation()

  // Pages où on cache navbar + footer
  const hiddenRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const hideLayout =
  hiddenRoutes.includes(location.pathname) ||
  location.pathname.startsWith('/reset-password')

  return (
    <div className="layout">

      {/* ===== BACKGROUND SLIDER ===== */}
      <div className="bg-fade">
        <div style={{ backgroundImage: `url(${bg1})` }} />
        <div style={{ backgroundImage: `url(${bg2})` }} />
        <div style={{ backgroundImage: `url(${bg3})` }} />
        <div style={{ backgroundImage: `url(${bg4})` }} />
      </div>

      {/* Overlay */}
      <div className="layout-bg-overlay" />

      {/* Navbar */}
      {!hideLayout && <Navbar />}

      {/* Content */}
      <main className="layout-content">
        {children}
      </main>

      {/* ===== FOOTER ===== */}
      {!hideLayout && (
        <>
          <footer className="layout-footer-top">
            <div className="footer-top-inner">

              <div className="footer-top-brand">
                <div className="footer-logo">UQO</div>
                <div className="footer-subtitle">
                  Université du Québec en Outaouais
                </div>
              </div>

              <div className="footer-top-grid">

                <div className="footer-col">
                  <h4>Gatineau</h4>
                  <p>283, boulevard Alexandre-Taché</p>
                  <p>Succursale Hull, Gatineau (Québec) Canada</p>
                  <p>J8X 3X7</p>

                  <div className="footer-spacer" />

                  <p><strong>Téléphone:</strong> 819 595-3900</p>
                  <p><strong>Sans frais:</strong> 1 800 567-1283</p>
                </div>

                <div className="footer-col">
                  <h4>Saint-Jérôme</h4>
                  <p>5, rue Saint-Joseph</p>
                  <p>Saint-Jérôme (Québec) Canada</p>
                  <p>J7Z 0B7</p>

                  <div className="footer-spacer" />

                  <p><strong>Téléphone:</strong> 450 530-7616</p>
                  <p><strong>Sans frais:</strong> 1 800 567-1283</p>
                </div>

              </div>
            </div>
          </footer>

          <footer className="layout-footer">
            <p>© 2026 UQO-Requests - Projet INF1743</p>
          </footer>
        </>
      )}

    </div>
  )
}

export default Layout