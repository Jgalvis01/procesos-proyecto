// src/hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import type { PostgrestResponse } from '@supabase/supabase-js'

type Producto = Database['public']['Tables']['producto']['Row']
type ProductoInsert = Database['public']['Tables']['producto']['Insert']
type ProductoUpdate = Database['public']['Tables']['producto']['Update']

// Helper function to handle Supabase types
async function updateProducto(data: ProductoUpdate, id: number): Promise<PostgrestResponse<any>> {
  // @ts-ignore - Known Supabase typing issue
  return supabase.from('producto').update(data).eq('id', id)
}

// Helper function to handle Supabase types
async function insertProducto(data: ProductoInsert): Promise<PostgrestResponse<any>> {
  // @ts-ignore - Known Supabase typing issue
  return supabase.from('producto').insert(data)
}

export interface ProductoFormData {
  codigo: string
  nombre: string
  precio: number
  stock: number
}

export interface ProductoFormErrors {
  codigo?: string
  nombre?: string
  precio?: string
  stock?: string
}

interface UseProductsReturn {
  products: Producto[]
  loading: boolean
  error: string | null
  createProduct: (data: ProductoFormData) => Promise<{ success: boolean; error?: string }>
  updateProduct: (id: number, data: ProductoFormData) => Promise<{ success: boolean; error?: string }>
  deleteProduct: (id: number, force?: boolean) => Promise<{ success: boolean; error?: string; hasAssociatedSales?: boolean }>
  toggleProductStatus: (id: number) => Promise<{ success: boolean; error?: string }>
  refreshProducts: () => Promise<void>
  searchProducts: (query: string) => Producto[]
}

export const useProducts = (): UseProductsReturn => {
  const { org } = useAuth()
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar productos
  const loadProducts = async () => {
    if (!org?.id) {
      console.log('⚠️ No hay org_id, no se pueden cargar productos')
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔧 Intentando cargar productos para org_id:', org.id)
      
      // Verificar autenticación antes de hacer la consulta
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔧 Estado de sesión (productos):', { 
        hasSession: !!session, 
        sessionError, 
        userId: session?.user?.id 
      })

      if (!session) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.')
      }
      
      const { data, error: fetchError } = await supabase
        .from('producto')
        .select('*')
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })

      console.log('🔧 Respuesta de consulta productos:', { data, fetchError })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setProducts(data || [])
      console.log('✅ Productos cargados exitosamente:', data?.length || 0)
    } catch (err) {
      console.error('❌ Error cargando productos:', err)
      setError('Error cargando productos')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar productos al montar el componente o cambiar la organización
  useEffect(() => {
    loadProducts()
  }, [org?.id])

  // Crear producto
  const createProduct = async (data: ProductoFormData): Promise<{ success: boolean; error?: string }> => {
    console.log('🔧 useProducts - createProduct llamado con:', data)
    
    if (!org?.id) {
      console.error('❌ No hay organización seleccionada')
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      const productData = {
        ...data,
        org_id: org.id,
      }

      console.log('🔧 Datos a insertar:', productData)
      const { error: insertError } = await insertProducto(productData)

      if (insertError) {
        console.error('❌ Error insertando producto:', insertError)
        // Verificar si es error de duplicado de código
        if (insertError.code === '23505') {
          return { success: false, error: 'Ya existe un producto con este código' }
        }
        return { success: false, error: insertError.message }
      }

      console.log('✅ Producto insertado exitosamente')
      // Recargar productos después de crear
      await loadProducts()
      return { success: true }
    } catch (err) {
      console.error('❌ Error creating product:', err)
      return { success: false, error: 'Error inesperado al crear el producto' }
    }
  }

  // Actualizar producto
  const updateProduct = async (id: number, data: ProductoFormData): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      const updateData = {
        ...data,
        org_id: org.id
      }

      const { error: updateError } = await updateProducto(updateData, id) // Asegurar que solo actualice productos de la org

      if (updateError) {
        // Verificar si es error de duplicado de código
        if (updateError.code === '23505') {
          return { success: false, error: 'Ya existe un producto con este código' }
        }
        return { success: false, error: updateError.message }
      }

      // Recargar productos después de actualizar
      await loadProducts()
      return { success: true }
    } catch (err) {
      console.error('Error updating product:', err)
      return { success: false, error: 'Error inesperado al actualizar el producto' }
    }
  }

  // Eliminar producto
  const deleteProduct = async (id: number, force: boolean = false): Promise<{ success: boolean; error?: string; hasAssociatedSales?: boolean }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      console.log('🔧 Intentando eliminar producto ID:', id, 'Force:', force)
      
      // Verificar si el producto tiene ventas asociadas (solo si no es forzado)
      if (!force) {
        const { data: ventasAsociadas, error: checkError } = await supabase
          .from('venta_item')
          .select('id')
          .eq('producto_id', id)
          .limit(1)

        if (checkError) {
          console.error('❌ Error verificando ventas asociadas:', checkError)
          return { success: false, error: 'Error verificando si el producto se puede eliminar' }
        }

        if (ventasAsociadas && ventasAsociadas.length > 0) {
          console.log('⚠️ Producto tiene ventas asociadas, requiere confirmación')
          return { 
            success: false, 
            hasAssociatedSales: true,
            error: 'El producto tiene ventas registradas. ¿Estás seguro de que quieres eliminarlo? Esto puede afectar el historial de ventas.' 
          }
        }
      }

      // Proceder con la eliminación (normal o forzada)
      if (force) {
        // Si es eliminación forzada, primero eliminar los registros relacionados
        console.log('🔧 Eliminación forzada: eliminando registros relacionados primero')
        
        // Eliminar items de venta asociados
        const { error: deleteItemsError } = await supabase
          .from('venta_item')
          .delete()
          .eq('producto_id', id)

        if (deleteItemsError) {
          console.error('❌ Error eliminando items de venta relacionados:', deleteItemsError)
          return { 
            success: false, 
            error: 'Error eliminando registros relacionados. No se pudo completar la eliminación forzada.' 
          }
        }

        console.log('✅ Items de venta relacionados eliminados')
      }

      // Proceder con la eliminación del producto
      const { error: deleteError } = await supabase
        .from('producto')
        .delete()
        .eq('id', id)
        .eq('org_id', org.id) // Asegurar que solo elimine productos de la org

      console.log('🔧 Resultado eliminación:', { deleteError })

      if (deleteError) {
        console.error('❌ Error eliminando producto:', deleteError)
        
        // Manejar diferentes tipos de errores
        if (deleteError.code === '23503') {
          return { 
            success: false, 
            error: 'No se puede eliminar el producto. Existe una restricción de base de datos que lo impide.' 
          }
        } else if (deleteError.code === '409') {
          return { success: false, error: 'El producto no se puede eliminar porque está en uso' }
        }
        return { success: false, error: `Error eliminando producto: ${deleteError.message}` }
      }

      console.log('✅ Producto eliminado exitosamente')
      // Recargar productos después de eliminar
      await loadProducts()
      return { success: true }
    } catch (err) {
      console.error('❌ Error deleting product:', err)
      return { success: false, error: 'Error inesperado al eliminar el producto' }
    }
  }

  // Refrescar productos
  const refreshProducts = async () => {
    await loadProducts()
  }

  // Buscar productos (US_008)
  const searchProducts = (query: string): Producto[] => {
    if (!query.trim()) {
      return products
    }

    const lowercaseQuery = query.toLowerCase().trim()
    
    return products.filter(product =>
      product.codigo.toLowerCase().includes(lowercaseQuery) ||
      product.nombre.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Alternar estado activo/inactivo del producto
  const toggleProductStatus = async (id: number): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      console.log('🔧 Alternando estado del producto ID:', id)
      
      // Obtener el estado actual del producto
      const { data: producto, error: getError } = await supabase
        .from('producto')
        .select('activo')
        .eq('id', id)
        .eq('org_id', org.id)
        .single() as { data: { activo: boolean } | null, error: any }

      if (getError) {
        console.error('❌ Error obteniendo producto:', getError)
        return { success: false, error: 'Error obteniendo información del producto' }
      }

      if (!producto) {
        return { success: false, error: 'Producto no encontrado' }
      }

      // Alternar el estado
      const nuevoEstado = !producto.activo
      const updateResult = await (supabase as any)
        .from('producto')
        .update({ activo: nuevoEstado })
        .eq('id', id)
        .eq('org_id', org.id)
      
      const updateError = updateResult.error

      if (updateError) {
        console.error('❌ Error actualizando estado del producto:', updateError)
        return { success: false, error: 'Error actualizando estado del producto' }
      }

      console.log(`✅ Producto ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`)
      // Recargar productos después de cambiar estado
      await loadProducts()
      return { success: true }
    } catch (err) {
      console.error('❌ Error toggling product status:', err)
      return { success: false, error: 'Error inesperado al cambiar estado del producto' }
    }
  }

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refreshProducts,
    searchProducts,
  }
}