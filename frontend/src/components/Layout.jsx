import Navbar from './Navbar'
import './Layout.css'

// ✅ Import image from /src/assets
import uqoBg from '../assets/uqo-campus-alexandre-tache.jpeg'

const Layout = ({ children }) => {
  return (
    <div className="layout" style={{ backgroundImage: `url(${uqoBg})` }}>
      {/* ✅ Dark overlay over the background image */}
      <div className="layout-bg-overlay" />

      <Navbar />

      <main className="layout-content">
        {children}
      </main>

      {/* ✅ Footer coordonnées */}
      <footer className="layout-footer-top">
        <div className="footer-top-inner">
          <div className="footer-top-brand">
            <div className="footer-logo">UQO</div>
            <div className="footer-subtitle">Université du Québec en Outaouais</div>
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

      {/* ✅ Footer bas */}
      <footer className="layout-footer">
        <p>© 2026 UQO-Requests - Projet INF1743</p>
      </footer>
    </div>
  )
}

export default Layout
