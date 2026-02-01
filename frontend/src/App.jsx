import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RequestDetailPage from './pages/RequestDetailPage'
import CreateRequestPage from './pages/CreateRequestPage'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Redirection racine */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/requests/new"
            element={
              <ProtectedRoute>
                <CreateRequestPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/requests/:id"
            element={
              <ProtectedRoute>
                <RequestDetailPage />
              </ProtectedRoute>
            }
          />
          
          {/* Route 404 */}
          <Route
            path="*"
            element={
              <div style={{ 
                minHeight: '60vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '2rem'
              }}>
                <h1 style={{ fontSize: '4rem' }}>404</h1>
                <h2>Page non trouvée</h2>
                <p>La page que vous recherchez n'existe pas.</p>
                <a 
                  href="/dashboard" 
                  style={{ 
                    marginTop: '2rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--color-primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px'
                  }}
                >
                  Retour au tableau de bord
                </a>
              </div>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App