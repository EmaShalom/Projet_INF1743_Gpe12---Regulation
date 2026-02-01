import Navbar from './Navbar'
import './Layout.css'

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-content">
        {children}
      </main>
      <footer className="layout-footer">
        <p>© 2026 UQO-Requests - Projet INF1743</p>
      </footer>
    </div>
  )
}

export default Layout