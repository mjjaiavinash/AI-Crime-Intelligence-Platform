import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute({ allowedRoles }) {
  const token = useAuthStore((s) => s.token)
  const user  = useAuthStore((s) => s.user)

  if (!token) return <Navigate to="/login" replace />
  // If token exists but user profile not yet loaded, wait (avoids premature /unauthorized redirect)
  if (allowedRoles && !user) return null
  if (allowedRoles && user && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
