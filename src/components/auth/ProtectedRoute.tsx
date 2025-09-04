// src/components/auth/ProtectedRoute.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../lib/supabase'
import NavBar from './NavBar'
import LoadingScreen from '../LoadingScreen'

interface ProtectedRouteProps {
  requiredRoles?: UserRole[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRoles = []
}) => {
  const { user, role, loading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingScreen message="Verificando permisos..." />
  }

  // Mostrar pantalla de sesión expirada si no hay usuario
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 max-w-md">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Sesión Expirada
            </h3>
            <p className="text-sm text-yellow-700 mb-6">
              Tu sesión ha expirado. Por favor, inicia sesión nuevamente o cierra la aplicación.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.href = '/login'
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si no hay rol asignado, mostrar mensaje de error con opciones
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Acceso Denegado
            </h3>
            <p className="text-sm text-red-700 mb-6">
              Tu cuenta no tiene permisos asignados. Contacta al administrador o intenta iniciar sesión nuevamente.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => window.location.href = '/login'}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.href = '/login'
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar Sesión
              </button>
            </div>
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
          <div className="bg-orange-50 border border-orange-200 rounded-md p-6 max-w-md">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0l6-6 6 6H6z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-orange-800 mb-2">
              Permisos Insuficientes
            </h3>
            <p className="text-sm text-orange-700 mb-4">
              No tienes permisos para acceder a esta página.
              <br />
              Tu rol actual: <span className="font-medium">{role}</span>
              <br />
              Roles requeridos: <span className="font-medium">{requiredRoles.join(', ')}</span>
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ir al Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  window.location.href = '/login'
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar Sesión
              </button>
            </div>
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