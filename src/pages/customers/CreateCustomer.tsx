// src/pages/customers/CreateCustomer.tsx
import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CustomerForm from '../../components/customers/CustomerForm'
import type { Cliente } from '../../lib/database.types'

const CreateCustomer: React.FC = () => {
  const navigate = useNavigate()

  const handleSuccess = (customer?: Cliente) => {
    if (!customer) return
    console.log('✅ Cliente creado exitosamente:', customer)
    // Redirigir a la lista de clientes después de crear
    navigate('/customers', { 
      replace: true,
      state: { message: `Cliente "${customer.nombre}" creado exitosamente` }
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/customers"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Clientes
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                / Nuevo Cliente
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Cliente</h1>
        <p className="mt-2 text-gray-600">
          Agrega un nuevo cliente a tu base de datos
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow-sm rounded-lg">
        <CustomerForm 
          onSuccess={handleSuccess}
          onCancel={() => navigate('/customers')}
        />
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg 
              className="h-5 w-5 text-blue-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información sobre el registro de clientes
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Solo el nombre es obligatorio, los demás campos son opcionales</li>
                <li>El correo electrónico debe tener un formato válido</li>
                <li>El documento de identidad será validado según el tipo seleccionado</li>
                <li>Los clientes se pueden buscar por nombre, documento o correo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCustomer
