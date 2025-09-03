// src/pages/products/CreateProduct.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { ProductForm } from '../../components/products'
import TestProductCreate from '../../components/TestProductCreate'

const CreateProductPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Crear Nuevo Producto</h1>
            <p className="mt-2 text-sm text-gray-700">
              Agrega un nuevo producto a tu inventario
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ← Volver a Productos
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            <ProductForm />
          </div>
        </div>
        
        {/* Test Component - Temporal para debugging */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="px-6 py-4">
            <h4 className="text-yellow-800 font-medium mb-2">🔧 Panel de Pruebas (Temporal)</h4>
            <p className="text-sm text-yellow-700 mb-4">
              Si el formulario principal no funciona, usa estos botones para probar la conexión directa:
            </p>
            <TestProductCreate />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProductPage
