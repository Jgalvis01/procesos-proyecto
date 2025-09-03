// src/pages/sales/CreateSale.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { SaleForm } from '../../components/sales'

const CreateSalePage: React.FC = () => {
  const handleSuccess = () => {
    // Redirigir a la lista de ventas después de crear
    window.location.href = '/sales'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Registrar Nueva Venta</h1>
            <p className="mt-2 text-sm text-gray-700">
              Procesa una nueva transacción de venta
            </p>
          </div>
          <Link
            to="/sales"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ← Volver a Ventas
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-6">
          <SaleForm 
            onSuccess={handleSuccess}
            onCancel={() => window.history.back()}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateSalePage
