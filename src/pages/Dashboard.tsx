// src/pages/Dashboard.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CreateTestUsers from '../components/CreateTestUsers'
import RoleSwitcher from '../components/RoleSwitcher'

const DashboardPage: React.FC = () => {
  const { hasPermission } = useAuth()

  const quickActions = [
    {
      title: 'Nueva Venta',
      description: 'Procesar transacción',
      href: '/sales/create',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      permissions: ['admin', 'manager', 'cashier']
    },
    {
      title: 'Gestionar Productos',
      description: 'Ver catálogo completo',
      href: '/products',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-blue-500 hover:bg-blue-600',
      permissions: ['admin', 'manager']
    },
    {
      title: 'Base de Clientes',
      description: 'Administrar contactos',
      href: '/customers',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-purple-500 hover:bg-purple-600',
      permissions: ['admin', 'manager', 'cashier']
    },
    {
      title: 'Control de Stock',
      description: 'Revisar inventario',
      href: '/inventory',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'bg-orange-500 hover:bg-orange-600',
      permissions: ['admin', 'manager']
    }
  ]

  const availableActions = quickActions.filter(action => 
    hasPermission(action.permissions as any)
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Solo los iconos principales funcionales */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {availableActions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className={`${action.color} p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white group transform hover:scale-105`}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-full group-hover:bg-opacity-30 transition-all duration-300">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {action.icon}
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Solo mostrar herramientas de admin para administradores */}
      {hasPermission(['admin']) && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Herramientas de Administrador</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <CreateTestUsers />
            <RoleSwitcher />
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
