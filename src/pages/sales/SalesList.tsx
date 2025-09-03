// src/pages/sales/SalesList.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const SalesListPage: React.FC = () => {
  const { hasPermission } = useAuth()
  const canCreateSales = hasPermission(['admin', 'manager', 'cashier'])

  // Mock data para mostrar
  const sales = []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Historial de Ventas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Consulta todas las transacciones realizadas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          {canCreateSales && (
            <Link
              to="/sales/create"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nueva Venta
            </Link>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {sales.length === 0 ? (
          <div className="text-center py-12">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2.5 2.5 0 014 0z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas registradas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza registrando tu primera venta.
            </p>
            {canCreateSales && (
              <div className="mt-6">
                <Link
                  to="/sales/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Nueva Venta
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-6">
            <p className="text-center text-gray-500">
              Lista de ventas se mostrará aquí
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesListPage
