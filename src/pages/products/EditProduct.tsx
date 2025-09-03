// src/pages/products/EditProduct.tsx
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductForm } from '../../components/products'
import { useProducts } from '../../hooks/useProducts'

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { products, loading } = useProducts()
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    if (id && products.length > 0) {
      const foundProduct = products.find(p => p.id === parseInt(id))
      setProduct(foundProduct || null)
    }
  }, [id, products])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Producto no encontrado</h1>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← Volver a Productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Editar Producto</h1>
            <p className="mt-2 text-sm text-gray-700">
              Modificar información del producto "{product.nombre}"
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-6">
          <ProductForm product={product} />
        </div>
      </div>
    </div>
  )
}

export default EditProductPage
