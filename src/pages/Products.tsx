// src/pages/Products.tsx
import React, { useState } from 'react'
import { ProductList, ProductForm } from '../components/products'
import type { Producto } from '../lib/database.types'

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEditProduct = (product: Producto) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setSelectedProduct(null)
    setIsFormOpen(false)
  }

  const handleFormCancel = () => {
    setSelectedProduct(null)
    setIsFormOpen(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Listado de todos los productos disponibles en el sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="max-w-lg">
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <ProductList 
        onEditProduct={handleEditProduct}
        searchQuery={searchQuery}
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    onClick={handleFormCancel}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ProductForm
                  product={selectedProduct}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
