// src/hooks/useSales.ts
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Venta = Database['public']['Tables']['venta']['Row']
type VentaItemInsert = Database['public']['Tables']['venta_item']['Insert']

// Tipos para formularios
export interface VentaFormItem {
  producto_id: number
  cantidad: number
  precio_unitario: number
}

export interface VentaFormData {
  cliente_id?: number | null
  items: VentaFormItem[]
}

// Hook para manejo de ventas
interface UseSalesReturn {
  sales: Venta[]
  loading: boolean
  error: string | null
  createSale: (data: VentaFormData) => Promise<{ success: boolean; sale?: Venta; error?: string }>
  refreshSales: () => Promise<void>
}

export const useSales = (): UseSalesReturn => {
  const { org, refreshSession } = useAuth()
  const [sales, setSales] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar ventas
  const loadSales = async () => {
    if (!org?.id) {
      console.log('⚠️ No hay org_id, no se pueden cargar ventas')
      setSales([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('🔧 DEBUG - Intentando cargar ventas para org_id:', org.id)
      console.log('🔧 DEBUG - Org completa:', org)
      
      // Verificar autenticación antes de hacer la consulta
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔧 DEBUG - Estado de sesión:', { 
        hasSession: !!session, 
        sessionError, 
        userId: session?.user?.id 
      })

      if (!session) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.')
      }

      console.log('🔧 DEBUG - Ejecutando consulta de ventas...')
      const { data, error } = await supabase
        .from('venta')
        .select('*')
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })

      console.log('🔧 DEBUG - Respuesta de consulta ventas:', { 
        data, 
        error, 
        dataLength: data?.length,
        firstSale: data?.[0]
      })

      if (error) throw error

      setSales(data || [])
      console.log('✅ Ventas cargadas exitosamente:', data?.length || 0)
    } catch (error) {
      console.error('❌ Error loading sales:', error)
      
      // Si es error de autenticación, intentar refrescar sesión
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('Unauthorized') || 
        error.message.includes('permission denied')
      )) {
        console.log('🔄 Error de autenticación, intentando refrescar sesión...')
        await refreshSession()
        
        // Reintentar una vez después del refresh
        try {
          const { data, error: retryError } = await supabase
            .from('venta')
            .select('*')
            .eq('org_id', org.id)
            .order('created_at', { ascending: false })

          if (!retryError) {
            setSales(data || [])
            console.log('✅ Ventas cargadas después de refresh de sesión')
            return
          }
        } catch (retryError) {
          console.error('❌ Error en reintento después de refresh:', retryError)
        }
      }
      
      setError(error instanceof Error ? error.message : 'Error al cargar ventas')
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  // Crear venta
  const createSale = async (data: VentaFormData): Promise<{ success: boolean; sale?: Venta; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    if (!data.items.length) {
      return { success: false, error: 'La venta debe tener al menos un producto' }
    }

    try {
      setLoading(true)

      // 1. Crear la venta con total
      const ventaInsert: any = {
        org_id: org.id,
        cliente_id: data.cliente_id,
        total: data.items.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0)
        // Removemos temporalmente 'numero' hasta verificar si existe
        // numero: generateSaleNumber()
      }

      console.log('🔧 Datos de venta a insertar (con total):', ventaInsert)

      const { data: ventaData, error: ventaError } = await supabase
        .from('venta')
        .insert(ventaInsert as any)
        .select()
        .single()

      console.log('🔧 Respuesta de inserción de venta:', { ventaData, ventaError })

      if (ventaError) {
        console.error('❌ Error específico en venta:', ventaError)
        throw ventaError
      }
      if (!ventaData) throw new Error('No se pudo crear la venta')

      // 2. Crear los items de la venta
      const items: VentaItemInsert[] = data.items.map(item => ({
        venta_id: (ventaData as any).id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))

      const { error: itemsError } = await supabase
        .from('venta_item')
        .insert(items as any)

      if (itemsError) {
        console.error('❌ Error creando items de venta:', itemsError)
        throw itemsError
      }

      // 3. **NUEVO: Actualizar stock de los productos**
      console.log('🔧 Actualizando stock de productos...')
      for (const item of data.items) {
        // Obtener el producto actual
        const { data: producto, error: productError } = await supabase
          .from('producto')
          .select('stock')
          .eq('id', item.producto_id)
          .single() as { data: { stock: number } | null, error: any }

        if (productError) {
          console.error(`❌ Error obteniendo producto ${item.producto_id}:`, productError)
          continue
        }

        if (!producto) {
          console.error(`❌ No se encontró el producto ${item.producto_id}`)
          continue
        }

        // Calcular nuevo stock
        const stockActual = producto.stock || 0
        const nuevoStock = stockActual - item.cantidad
        console.log(`📦 Producto ${item.producto_id}: Stock actual ${stockActual} - Vendido ${item.cantidad} = Nuevo stock ${nuevoStock}`)

        // Actualizar el stock - usando any para evitar problemas de tipos temporalmente
        const updateResult = await (supabase as any)
          .from('producto')
          .update({ stock: Math.max(0, nuevoStock) })
          .eq('id', item.producto_id)
        
        const updateError = updateResult.error

        if (updateError) {
          console.error(`❌ Error actualizando stock del producto ${item.producto_id}:`, updateError)
        } else {
          console.log(`✅ Stock actualizado para producto ${item.producto_id}`)
        }
      }

      // 4. Recargar ventas
      await loadSales()

      console.log('✅ Venta creada exitosamente con stock actualizado')
      return { success: true, sale: ventaData }
    } catch (error) {
      console.error('Error creating sale:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al crear la venta' 
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshSales = async () => {
    await loadSales()
  }

  useEffect(() => {
    loadSales()
  }, [org?.id])

  return {
    sales,
    loading,
    error,
    createSale,
    refreshSales
  }
}
