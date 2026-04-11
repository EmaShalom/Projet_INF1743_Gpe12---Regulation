import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const ProtectedRoute = ({ children }) => {
  const { estConnecte, isLoading } = useAuth()

  if (isLoading) return null

  if (!estConnecte) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
