import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { Routes, Route } from 'react-router-dom'

// Pages
import TestPage from "./pages/TestPage"
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RequestDetailPage from './pages/RequestDetailPage'
import CreateRequestPage from './pages/CreateRequestPage'
import EditRequestPage from './pages/EditRequestPage'
import NotificationsPage from './pages/NotificationsPage'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/" element={<HomePage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />

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

            <Route
              path="/requests/:id/edit"
              element={
                <ProtectedRoute>
                  <EditRequestPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
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
                    href="/"
                    style={{
                      marginTop: '2rem',
                      padding: '0.75rem 1.5rem',
                      background: 'var(--color-primary)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px'
                    }}
                  >
                    Retour à l’accueil
                  </a>
                </div>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App