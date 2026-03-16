import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: ReactNode
  role?: 'Customer' | 'Retailer'
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'Retailer' ? '/retailer' : '/home'} replace />
  }
  return <>{children}</>
}
