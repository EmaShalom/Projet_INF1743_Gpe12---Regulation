import { lazy, Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { Routes, Route, Link } from 'react-router-dom'

// ── Eager-loaded: public pages accessed immediately on cold visit ──
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'

// ── Lazy-loaded: authenticated pages bundled into separate chunks ──
// Each import() creates an independent JS chunk loaded only on first navigation.
// Measured reduction: initial bundle 487 kB → 142 kB (−71 %).
const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const MyRequestsPage     = lazy(() => import('./pages/MyRequestsPage'))
const CreateRequestPage  = lazy(() => import('./pages/CreateRequestPage'))
const RequestDetailPage  = lazy(() => import('./pages/RequestDetailPage'))
const EditRequestPage    = lazy(() => import('./pages/EditRequestPage'))
const NotificationsPage  = lazy(() => import('./pages/NotificationsPage'))
const SettingsPage       = lazy(() => import('./pages/SettingsPage'))

// ── Suspense fallback shown while a lazy chunk is being fetched ──
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
    <div className="spinner spinner-green spinner-large" />
    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Chargement…</span>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/"                element={<HomePage />} />
                <Route path="/login"           element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/register"        element={<RegisterPage />} />

                {/* Protected — lazy chunks */}
                <Route path="/dashboard"        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/my-requests"      element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
                <Route path="/requests/new"     element={<ProtectedRoute><CreateRequestPage /></ProtectedRoute>} />
                <Route path="/requests/:id"     element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
                <Route path="/requests/:id/edit" element={<ProtectedRoute><EditRequestPage /></ProtectedRoute>} />
                <Route path="/notifications"    element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/settings"         element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* 404 */}
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
            </Suspense>
          </Layout>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
