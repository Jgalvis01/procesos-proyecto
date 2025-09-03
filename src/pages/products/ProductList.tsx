// src/pages/products/ProductList.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../contexts/AuthContext'

const ProductListPage: React.FC = () => {
  const { products, loading, deleteProduct } = useProducts()
  const { hasPermission } = useAuth()
  
  const canManageProducts = hasPermission(['admin', 'manager'])

  const handleDelete = async (id: number, name: string, forceDelete: boolean = false) => {
    if (!forceDelete && !window.confirm(`¿Estás seguro de que quieres eliminar el producto "${name}"?`)) {
      return
    }

    try {
      const { success, error, hasAssociatedSales } = await deleteProduct(id, forceDelete)
      
      if (!success && hasAssociatedSales && !forceDelete) {
        // El producto tiene ventas asociadas, preguntar si quiere forzar la eliminación
        const confirmForce = window.confirm(
          `⚠️ "${name}" tiene ventas asociadas.\n\n` +
          `Si lo eliminas, también se eliminarán todas las ventas relacionadas.\n\n` +
          `¿Estás seguro de que quieres proceder con la eliminación?`
        )
        
        if (confirmForce) {
          // Llamar de nuevo con force = true
          await handleDelete(id, name, true)
          return
        }
      } else if (!success && error) {
        alert(error)
      } else if (success) {
        // Eliminación exitosa
        if (forceDelete) {
          alert(`✅ "${name}" ha sido eliminado completamente del sistema.`)
        }
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Error inesperado al eliminar el producto')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Lista de Productos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona todos los productos de tu inventario
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <Link
            to="/products/create"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Nuevo Producto
          </Link>
          <Link
            to="/products/categories"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Categorías
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {products.length === 0 ? (
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando tu primer producto.
            </p>
            <div className="mt-6">
              <Link
                to="/products/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nuevo Producto
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">{product.nombre}</h4>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                            ID: {product.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Código: {product.codigo}</p>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="font-medium text-green-600">${product.precio}</span>
                          <span>Creado: {new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {canManageProducts && (
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.nombre)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ProductListPage
