import { Navigate, Outlet } from 'react-router-dom'
import { decodeToken } from '../../services/api'

type Props = {
  allowedRoles?: string[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const decoded = decodeToken()

  if (!decoded) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
