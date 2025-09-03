// Componente de prueba para verificar inserción directa en Supabase
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProducts } from '../hooks/useProducts'

const TestProductCreate: React.FC = () => {
  const { org } = useAuth()
  const { createProduct } = useProducts()
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testCreateProduct = async () => {
    setIsLoading(true)
    setStatus('🔧 Probando creación de producto sin stock...')
    
    try {
      const testProduct = {
        codigo: `TEST_${Date.now()}`,
        nombre: 'Producto de Prueba',
        precio: 100,
        stock: 0
      }

      console.log('🔧 Intentando crear producto:', testProduct)
      const result = await createProduct(testProduct)

      if (result.success) {
        setStatus('✅ ¡Producto creado exitosamente!')
      } else {
        setStatus(`❌ Error: ${result.error}`)
      }

    } catch (error) {
      console.error('❌ Error inesperado:', error)
      setStatus(`❌ Error inesperado: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testWithStock = async () => {
    setIsLoading(true)
    setStatus('🔧 Probando creación con stock...')
    
    try {
      const testProductWithStock = {
        codigo: `STOCK_TEST_${Date.now()}`,
        nombre: 'Producto con Stock',
        precio: 150,
        stock: 25
      }

      console.log('🔧 Intentando crear producto con stock:', testProductWithStock)
      const result = await createProduct(testProductWithStock)

      if (result.success) {
        setStatus('✅ ¡Producto con stock creado exitosamente!')
      } else {
        setStatus(`❌ Error con stock: ${result.error}`)
        
        // Si falla con stock, la columna no existe
        if (result.error?.includes('stock') || result.error?.includes('column')) {
          setStatus('❌ CONFIRMADO: Problema con el campo STOCK en la base de datos')
        }
      }

    } catch (error) {
      console.error('❌ Error inesperado:', error)
      setStatus(`❌ Error inesperado: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">🧪 Pruebas de Base de Datos</h3>
      
      <div className="space-y-4">
        <button
          onClick={testCreateProduct}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Probando...' : 'Probar Creación Sin Stock'}
        </button>

        <button
          onClick={testWithStock}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Probando...' : 'Probar Creación Con Stock'}
        </button>
      </div>

      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm whitespace-pre-wrap">{status}</pre>
        </div>
      )}
    </div>
  )
}

export default TestProductCreate
