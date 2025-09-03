// src/components/products/ProductForm.tsx
import React, { useState, useEffect } from 'react'
import { useProducts} from '../../hooks/useProducts'
import type{ Producto } from '../../lib/database.types'
import type { ProductoFormData, ProductoFormErrors } from '../../hooks/useProducts'

interface ProductFormProps {
  product?: Producto | null
  onSuccess?: () => void
  onCancel?: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({
  product = null,
  onSuccess,
  onCancel
}) => {
  const { createProduct, updateProduct } = useProducts()
  const [formData, setFormData] = useState<ProductoFormData>({
    codigo: '',
    nombre: '',
    precio: 0,
    stock: 0,
  })
  const [errors, setErrors] = useState<ProductoFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isEditing = Boolean(product)

  // Llenar formulario si es edición
  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.codigo,
        nombre: product.nombre,
        precio: product.precio,
        stock: product.stock || 0,
      })
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        precio: 0,
        stock: 0,
      })
    }
    setErrors({})
    setSubmitError('')
    setSuccessMessage('')
  }, [product])

  const validateForm = (): boolean => {
    console.log('🔧 Iniciando validación con datos:', formData)
    const newErrors: ProductoFormErrors = {}

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido'
      console.log('❌ Error código: vacío')
    } else if (formData.codigo.trim().length < 2) {
      newErrors.codigo = 'El código debe tener al menos 2 caracteres'
      console.log('❌ Error código: muy corto -', formData.codigo.length, 'caracteres')
    } else {
      console.log('✅ Código válido:', formData.codigo)
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
      console.log('❌ Error nombre: vacío')
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
      console.log('❌ Error nombre: muy corto -', formData.nombre.length, 'caracteres')
    } else {
      console.log('✅ Nombre válido:', formData.nombre)
    }

    if (formData.precio < 0) {
      newErrors.precio = 'El precio no puede ser negativo'
      console.log('❌ Error precio: negativo -', formData.precio)
    } else {
      console.log('✅ Precio válido:', formData.precio)
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo'
      console.log('❌ Error stock: negativo -', formData.stock)
    } else {
      console.log('✅ Stock válido:', formData.stock)
    }

    console.log('🔧 Errores encontrados:', newErrors)
    console.log('🔧 Cantidad de errores:', Object.keys(newErrors).length)

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ProductoFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'precio' || field === 'stock' ? Number(value) : value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
    
    setSubmitError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔧 ProductForm - handleSubmit iniciado')
    console.log('🔧 FormData actual:', formData)
    
    if (!validateForm()) {
      console.log('❌ Validación fallida')
      return
    }

    console.log('✅ Validación pasada')

    setIsSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      console.log('🔧 Enviando datos del producto:', formData)
      const result = isEditing 
        ? await updateProduct(product!.id, formData)
        : await createProduct(formData)

      if (result.success) {
        const message = isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'
        setSuccessMessage(message)
        console.log('✅', message)
        
        onSuccess?.()
        if (!isEditing) {
          // Limpiar formulario si es creación
          setFormData({ codigo: '', nombre: '', precio: 0, stock: 0 })
        }
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000)
      } else if (result.error) {
        setSubmitError(result.error)
        console.error('❌ Error creando/actualizando producto:', result.error)
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      setSubmitError('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEditing ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
        </p>
      </div>

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-red-800">Error</h4>
          <p className="text-sm text-red-700 mt-1">{submitError}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-green-800">¡Éxito!</h4>
          <p className="text-sm text-green-700 mt-1">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
            Código del producto *
          </label>
          <input
            type="text"
            id="codigo"
            value={formData.codigo}
            onChange={(e) => handleInputChange('codigo', e.target.value.trim())}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.codigo ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="Ej: PROD001"
            disabled={isSubmitting}
          />
          {errors.codigo && (
            <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
          )}
        </div>

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre del producto *
          </label>
          <input
            type="text"
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.nombre ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="Nombre del producto"
            disabled={isSubmitting}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
            Precio *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="precio"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                handleInputChange('precio', value);
              }}
              className={`block w-full pl-7 pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.precio ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">COP</span>
            </div>
          </div>
          {errors.precio && (
            <p className="mt-1 text-sm text-red-600">{errors.precio}</p>
          )}
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Stock Inicial *
          </label>
          <input
            type="number"
            id="stock"
            min="0"
            value={formData.stock}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseInt(e.target.value);
              handleInputChange('stock', value);
            }}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.stock ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="0"
            disabled={isSubmitting}
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                {isEditing ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              isEditing ? 'Actualizar Producto' : 'Crear Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm