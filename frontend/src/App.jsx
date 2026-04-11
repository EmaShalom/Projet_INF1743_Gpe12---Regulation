import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { Routes, Route, Link } from 'react-router-dom'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RequestDetailPage from './pages/RequestDetailPage'
import CreateRequestPage from './pages/CreateRequestPage'
import EditRequestPage from './pages/EditRequestPage'
import NotificationsPage from './pages/NotificationsPage'
import MyRequestsPage from './pages/MyRequestsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/my-requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
              <Route path="/requests/new" element={<ProtectedRoute><CreateRequestPage /></ProtectedRoute>} />
              <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
              <Route path="/requests/:id/edit" element={<ProtectedRoute><EditRequestPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              <Route path="*" element={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--color-primary)' }}>404</div>
                  <h2 style={{ color: 'var(--color-text-primary)' }}>Page non trouvée</h2>
                  <p style={{ color: 'var(--color-text-muted)' }}>La page que vous recherchez n'existe pas.</p>
                  <Link to="/" style={{ padding: '10px 24px', background: 'var(--color-primary)', color: 'white', borderRadius: '10px', fontWeight: 600, marginTop: '8px' }}>
                    Retour à l'accueil
                  </Link>
                </div>
              } />
            </Routes>
          </Layout>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
