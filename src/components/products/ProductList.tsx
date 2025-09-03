// src/components/products/ProductList.tsx
import React, { useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../contexts/AuthContext'
import type { Producto } from '../../lib/database.types'

interface ProductListProps {
  onEditProduct?: (product: Producto) => void
  onSelectProduct?: (product: Producto) => void
  searchQuery?: string
  selectable?: boolean
}

const ProductList: React.FC<ProductListProps> = ({
  onEditProduct,
  onSelectProduct,
  searchQuery = '',
  selectable = false
}) => {
  const { hasPermission } = useAuth()
  const { products, loading, error, deleteProduct, searchProducts } = useProducts()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Productos filtrados por búsqueda
  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products

  const handleDelete = async (product: Producto, forceDelete: boolean = false) => {
    if (!forceDelete && !confirm(`¿Estás seguro de que quieres eliminar "${product.nombre}"?`)) {
      return
    }

    setDeletingId(product.id)
    try {
      const { success, error, hasAssociatedSales } = await deleteProduct(product.id, forceDelete)
      
      if (!success && hasAssociatedSales && !forceDelete) {
        // El producto tiene ventas asociadas, preguntar si quiere forzar la eliminación
        const confirmForce = confirm(
          `⚠️ "${product.nombre}" tiene ventas asociadas.\n\n` +
          `Si lo eliminas, también se eliminarán todas las ventas relacionadas.\n\n` +
          `¿Estás seguro de que quieres proceder con la eliminación?`
        )
        
        if (confirmForce) {
          // Llamar de nuevo con force = true
          await handleDelete(product, true)
          return
        }
      } else if (!success && error) {
        alert(error)
      } else if (success) {
        // Eliminación exitosa
        if (forceDelete) {
          alert(`✅ "${product.nombre}" ha sido eliminado completamente del sistema.`)
        }
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600 font-medium">Cargando productos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="font-medium text-red-800">Error al cargar productos</h3>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-6">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}
        </h3>
        <p className="text-gray-600 mb-6">
          {searchQuery 
            ? `No hay productos que coincidan con "${searchQuery}"` 
            : 'Comienza agregando tu primer producto al inventario.'
          }
        </p>
        {!searchQuery && (
          <button className="btn-primary" onClick={() => window.location.href = '/products/create'}>
            Crear primer producto
          </button>
        )}
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="table-modern">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Código
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Producto
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Precio
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 010-2h4z" />
                  </svg>
                  Stock
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8" />
                  </svg>
                  Estado
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredProducts.map((product: Producto) => (
              <tr 
                key={product.id} 
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${selectable ? 'cursor-pointer hover:shadow-sm' : ''} ${
                  product.stock <= 5 ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                }`}
                onClick={() => selectable && onSelectProduct?.(product)}
              >
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs font-semibold text-gray-700">{product.codigo.slice(0, 2)}</span>
                    </div>
                    <span className="font-mono text-sm font-medium text-gray-900">{product.codigo}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{product.nombre}</span>
                    <span className="text-xs text-gray-500">ID: {product.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800">
                    {formatPrice(product.precio)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.stock > 5 
                        ? 'bg-yellow-100 text-yellow-800'
                        : product.stock > 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.stock > 0 ? `${product.stock} unidades` : 'Sin stock'}
                    </span>
                    {product.stock <= 5 && product.stock > 0 && (
                      <svg className="w-4 h-4 ml-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.activo !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.activo !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {selectable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectProduct?.(product)
                        }}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        Seleccionar
                      </button>
                    )}
                    
                    {hasPermission(['admin', 'manager']) && onEditProduct && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditProduct(product)
                        }}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    )}
                    
                    {hasPermission(['admin']) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(product)
                        }}
                        disabled={deletingId === product.id}
                        className="btn-danger text-xs px-3 py-1.5 disabled:opacity-50"
                      >
                        {deletingId === product.id ? (
                          <div className="flex items-center">
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                            Eliminando...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductList