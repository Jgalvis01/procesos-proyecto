// src/components/auth/ProtectedRoute.tsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../lib/supabase'
import NavBar from './NavBar'
import LoadingScreen from '../LoadingScreen'

interface ProtectedRouteProps {
  requiredRoles?: UserRole[]
  fallbackPath?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRoles = [],
  fallbackPath = '/login'
}) => {
  const { user, role, loading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingScreen message="Verificando permisos..." />
  }

  // Redirigir al login si no hay usuario
  if (!user) {
    return <Navigate to={fallbackPath} replace />
  }

  // Si no hay rol asignado, mostrar mensaje de error
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Acceso Denegado
            </h3>
            <p className="text-sm text-red-700 mb-4">
              Tu cuenta no tiene permisos asignados. Contacta al administrador.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="text-red-800 hover:text-red-900 underline"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Verificar permisos si se especificaron roles requeridos
  if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 max-w-md">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Permisos Insuficientes
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              No tienes permisos para acceder a esta página.
              <br />
              Tu rol actual: <span className="font-medium">{role}</span>
              <br />
              Roles requeridos: <span className="font-medium">{requiredRoles.join(', ')}</span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="text-yellow-800 hover:text-yellow-900 underline"
            >
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Si todo está bien, renderizar las rutas anidadas usando Outlet
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  )
}

export default ProtectedRoute