// src/components/sales/SaleForm.tsx
import React, { useState } from 'react'
import { useSales, type VentaFormItem } from '../../hooks/useSales'
import { useProducts } from '../../hooks/useProducts'
import { useCustomers } from '../../hooks/useCustomers'
import { useStockValidation } from '../../hooks/useStockValidation'
import { formatCurrency } from '../../utils/formatters'
import type { Producto, Cliente } from '../../lib/database.types'

interface SaleFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const SaleForm: React.FC<SaleFormProps> = ({ onSuccess, onCancel }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null)
  const [items, setItems] = useState<VentaFormItem[]>([])
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQuickCustomerForm, setShowQuickCustomerForm] = useState(false)
  const [quickCustomerName, setQuickCustomerName] = useState('')
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  
  const { createSale } = useSales()
  const { products, searchProducts } = useProducts()
  const { customers, searchCustomers, createCustomer, refreshCustomers } = useCustomers()
  const { validateStock } = useStockValidation()

  // Productos filtrados para búsqueda
  const filteredProducts = productSearchQuery ? searchProducts(productSearchQuery) : []
  const filteredCustomers = customerSearchQuery ? searchCustomers(customerSearchQuery) : customers

  // Calcular totales
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)
  const totalVenta = items.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)

  const handleProductSelect = (product: Producto) => {
    setProductSearchQuery('')
    
    // Verificar si ya existe el producto en los items
    const existingItemIndex = items.findIndex(item => item.producto_id === product.id)
    
    if (existingItemIndex >= 0) {
      // Incrementar cantidad si ya existe
      const newItems = [...items]
      const newQuantity = newItems[existingItemIndex].cantidad + 1
      
      // Validar stock
      const validation = validateStock(product.id, newQuantity)
      if (!validation.isValid) {
        setError(validation.message)
        return
      }
      
      newItems[existingItemIndex].cantidad = newQuantity
      setItems(newItems)
    } else {
      // Validar stock para nuevo producto
      const validation = validateStock(product.id, 1)
      if (!validation.isValid) {
        setError(validation.message)
        return
      }
      
      // Agregar nuevo producto
      setItems([...items, {
        producto_id: product.id,
        cantidad: 1,
        precio_unitario: product.precio
      }])
    }
    
    setError(null)
  }

  const handleCustomerSelect = (customer: Cliente) => {
    setSelectedCustomer(customer)
    setCustomerSearchQuery('')
  }

  // Función para crear cliente rápido
  const handleQuickCustomerCreate = async () => {
    if (!quickCustomerName.trim()) {
      setError('El nombre del cliente es requerido')
      return
    }

    setIsCreatingCustomer(true)
    setError(null)

    try {
      const result = await createCustomer({
        nombre: quickCustomerName.trim()
      })

      if (result.success && result.customer) {
        setSelectedCustomer(result.customer)
        setQuickCustomerName('')
        setShowQuickCustomerForm(false)
        setCustomerSearchQuery('')
        await refreshCustomers()
        console.log('✅ Cliente creado y seleccionado:', result.customer.nombre)
      } else {
        setError(result.error || 'Error al crear el cliente')
      }
    } catch (error) {
      console.error('Error creando cliente:', error)
      setError('Error inesperado al crear el cliente')
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    
    const newItems = [...items]
    const item = newItems[index]
    
    // Validar stock
    const validation = validateStock(item.producto_id, quantity)
    if (!validation.isValid) {
      setError(validation.message)
      return
    }
    
    item.cantidad = quantity
    setItems(newItems)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      setError('La venta debe tener al menos un producto')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const result = await createSale({
        cliente_id: selectedCustomer?.id || null,
        items
      })
      
      if (!result.success) {
        setError(result.error || 'Error al crear la venta')
        return
      }
      
      if (onSuccess) onSuccess()
    } catch (error) {
      setError('Error inesperado al procesar la venta')
      console.error('Error en handleSubmit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProductName = (productoId: number) => {
    const product = products.find(p => p.id === productoId)
    return product ? product.nombre : 'Producto no encontrado'
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Registrar Nueva Venta</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Cliente */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Cliente (opcional)
          </label>
          
          {selectedCustomer ? (
            <div className="flex items-center justify-between bg-gray-50 p-2 border rounded">
              <span>{selectedCustomer.nombre}</span>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ) : (
            <div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickCustomerForm(true)
                    setQuickCustomerName('')
                  }}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 whitespace-nowrap"
                >
                  + Cliente
                </button>
              </div>
              
              {customerSearchQuery && (
                <div className="mt-1 bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    <>
                      {filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          <div className="font-medium">{customer.nombre}</div>
                          {customer.idnum && (
                            <div className="text-sm text-gray-500">{customer.tipo_id}: {customer.idnum}</div>
                          )}
                        </button>
                      ))}
                      {/* Botón para crear cliente rápido */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickCustomerForm(true)
                          setQuickCustomerName(customerSearchQuery)
                        }}
                        className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-t border-gray-200"
                      >
                        <div className="font-medium">+ Crear nuevo cliente: "{customerSearchQuery}"</div>
                        <div className="text-sm">Agregar como nuevo cliente</div>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 text-gray-500">No se encontraron clientes</div>
                      {/* Botón para crear cliente rápido cuando no hay resultados */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickCustomerForm(true)
                          setQuickCustomerName(customerSearchQuery)
                        }}
                        className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-t border-gray-200"
                      >
                        <div className="font-medium">+ Crear cliente: "{customerSearchQuery}"</div>
                        <div className="text-sm">Agregar como nuevo cliente</div>
                      </button>
                    </>
                  )}
                </div>
              )}
              
              {/* Formulario rápido para crear cliente */}
              {showQuickCustomerForm && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-900">Crear Cliente Rápido</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuickCustomerForm(false)
                        setQuickCustomerName('')
                      }}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={quickCustomerName}
                      onChange={(e) => setQuickCustomerName(e.target.value)}
                      placeholder="Nombre del cliente"
                      className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleQuickCustomerCreate()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleQuickCustomerCreate}
                      disabled={isCreatingCustomer || !quickCustomerName.trim()}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingCustomer ? '...' : 'Crear'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Productos */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Buscar Productos
          </label>
          
          <input
            type="text"
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            placeholder="Buscar productos por código o nombre..."
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          
          {productSearchQuery && (
            <div className="mt-1 bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{product.nombre}</div>
                        <div className="text-sm text-gray-500">Código: {product.codigo}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(product.precio)}</div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">No se encontraron productos</div>
              )}
            </div>
          )}
        </div>
        
        {/* Lista de productos seleccionados */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Productos en la venta</h3>
          
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded">
              No hay productos agregados
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {getProductName(item.producto_id)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatCurrency(item.precio_unitario)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, item.cantidad - 1)}
                            className="text-gray-500 hover:text-gray-700 px-1"
                          >
                            -
                          </button>
                          <span className="mx-2 w-8 text-center">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, item.cantidad + 1)}
                            className="text-gray-500 hover:text-gray-700 px-1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatCurrency(item.cantidad * item.precio_unitario)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                      Total ({totalItems} items):
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(totalVenta)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${isSubmitting || items.length === 0 
                      ? 'bg-blue-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Procesando...' : 'Finalizar Venta'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SaleForm
