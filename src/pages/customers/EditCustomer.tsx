// src/pages/customers/EditCustomer.tsx
import React from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useCustomers } from '../../hooks/useCustomers'
import CustomerForm from '../../components/customers/CustomerForm'
import type { Cliente } from '../../lib/database.types'

const EditCustomer: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { customers, loading } = useCustomers()

  // Buscar el cliente por ID
  const customer = customers.find(c => c.id === parseInt(id || '0'))

  const handleSuccess = (updatedCustomer?: Cliente) => {
    if (!updatedCustomer) return
    console.log('✅ Cliente actualizado exitosamente:', updatedCustomer)
    // Redirigir a la lista de clientes después de editar
    navigate('/customers', { 
      replace: true,
      state: { message: `Cliente "${updatedCustomer.nombre}" actualizado exitosamente` }
    })
  }

  // Si está cargando
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando cliente...</p>
        </div>
      </div>
    )
  }

  // Si no se encuentra el cliente
  if (!customer) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Cliente no encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            El cliente que intentas editar no existe o ha sido eliminado.
          </p>
          <div className="mt-6">
            <Link
              to="/customers"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    )
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
                / Editar Cliente
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
        <p className="mt-2 text-gray-600">
          Modifica la información de {customer.nombre}
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow-sm rounded-lg">
        <CustomerForm 
          customer={customer}
          onSuccess={handleSuccess}
          onCancel={() => navigate('/customers')}
        />
      </div>
    </div>
  )
}

export default EditCustomer
