// src/components/customers/CustomerForm.tsx
import React, { useState, useEffect } from 'react'
import { useCustomers } from '../../hooks/useCustomers'
import  type { Cliente } from '../../lib/database.types'
import { isValidEmail, isValidId, sanitizeString } from '../../utils/validators'
import type { ClienteFormData } from '../../hooks/useCustomers'
interface CustomerFormProps {
  customer?: Cliente | null
  onSuccess?: (customer?: Cliente) => void
  onCancel?: () => void
}

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PP', label: 'Pasaporte' },
]

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer = null,
  onSuccess,
  onCancel
}) => {
  const { createCustomer, updateCustomer } = useCustomers()
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    tipo_id: '',
    idnum: '',
    correo: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ClienteFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const isEditing = Boolean(customer)

  // Llenar formulario si es edición
  useEffect(() => {
    if (customer) {
      setFormData({
        nombre: customer.nombre,
        tipo_id: customer.tipo_id || '',
        idnum: customer.idnum || '',
        correo: customer.correo || '',
      })
    } else {
      setFormData({
        nombre: '',
        tipo_id: '',
        idnum: '',
        correo: '',
      })
    }
    setErrors({})
    setSubmitError('')
  }, [customer])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClienteFormData, string>> = {}

    // Validar nombre (requerido)
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar email si se proporciona
    if (formData.correo && !isValidEmail(formData.correo)) {
      newErrors.correo = 'El formato del correo electrónico no es válido'
    }

    // Validar documento si se proporciona
    if (formData.idnum && formData.tipo_id) {
      const idValidation = isValidId(formData.idnum, formData.tipo_id)
      if (!idValidation.valid) {
        newErrors.idnum = idValidation.message
      }
    } else if (formData.idnum && !formData.tipo_id) {
      newErrors.tipo_id = 'Selecciona el tipo de documento'
    } else if (!formData.idnum && formData.tipo_id) {
      newErrors.idnum = 'Ingresa el número de documento'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ClienteFormData, value: string) => {
    let processedValue = value
    
    // Procesar según el campo
    if (field === 'nombre') {
      processedValue = sanitizeString(value)
    } else if (field === 'correo') {
      processedValue = value.toLowerCase().trim()
    } else if (field === 'idnum' && formData.tipo_id) {
      // Solo permitir números para la mayoría de documentos
      if (['CC', 'TI', 'CE', 'NIT'].includes(formData.tipo_id)) {
        processedValue = value.replace(/\D/g, '')
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
    
    setSubmitError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Limpiar datos antes de enviar
      const cleanData: ClienteFormData = {
        nombre: sanitizeString(formData.nombre),
        tipo_id: formData.tipo_id?.trim() || null,
        idnum: formData.idnum?.trim() || null,
        correo: formData.correo?.trim().toLowerCase() || null,
      }

      if (isEditing && customer) {
        // Handle update
        const result = await updateCustomer(customer.id, cleanData)
        if (result.success) {
          // Pass back the updated customer data
          onSuccess?.({
            ...customer,
            ...cleanData,
            id: customer.id,
            org_id: customer.org_id,
            created_at: customer.created_at
          })
        } else if (result.error) {
          setSubmitError(result.error)
        }
      } else {
        // Handle create
        const result = await createCustomer(cleanData)
        if (result.success && result.customer) {
          onSuccess?.(result.customer)
          // Limpiar formulario si es creación
          setFormData({ nombre: '', tipo_id: '', idnum: '', correo: '' })
        } else if (result.error) {
          setSubmitError(result.error)
        }
      }
    } catch (error) {
      setSubmitError('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEditing ? 'Modifica los datos del cliente' : 'Completa la información del nuevo cliente'}
        </p>
      </div>

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-red-800">Error</h4>
          <p className="text-sm text-red-700 mt-1">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre completo *
          </label>
          <input
            type="text"
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.nombre ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="Nombre completo del cliente"
            disabled={isSubmitting}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tipo_id" className="block text-sm font-medium text-gray-700">
              Tipo de documento
            </label>
            <select
              id="tipo_id"
              value={formData.tipo_id || ''}
              onChange={(e) => handleInputChange('tipo_id', e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.tipo_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              disabled={isSubmitting}
            >
              <option value="">Seleccionar...</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.tipo_id && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="idnum" className="block text-sm font-medium text-gray-700">
              Número de documento
            </label>
            <input
              type="text"
              id="idnum"
              value={formData.idnum || ''}
              onChange={(e) => handleInputChange('idnum', e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.idnum ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Número de documento"
              disabled={isSubmitting}
            />
            {errors.idnum && (
              <p className="mt-1 text-sm text-red-600">{errors.idnum}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            id="correo"
            value={formData.correo || ''}
            onChange={(e) => handleInputChange('correo', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.correo ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="correo@ejemplo.com"
            disabled={isSubmitting}
          />
          {errors.correo && (
            <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
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
              isEditing ? 'Actualizar Cliente' : 'Crear Cliente'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CustomerForm