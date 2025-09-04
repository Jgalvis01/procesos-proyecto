import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '../lib/database.types'

type ProductoRow = Database['public']['Tables']['producto']['Row']

interface ProductoInventario extends ProductoRow {
  stock: number
}

export function useInventory() {
  const [inventory, setInventory] = useState<ProductoInventario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { org } = useAuth()

  const loadInventory = async () => {
    if (!org?.id) return
    
    try {
      setLoading(true)
      setError(null)

      console.log('🔧 useInventory - Cargando inventario para org:', org.id)

      // 1. Obtener todos los productos de la organización
      const { data: productos, error: productosError } = await supabase
        .from('producto')
        .select('*')
        .eq('org_id', org.id)

      if (productosError) throw productosError
      if (!productos) throw new Error('No se encontraron productos')

      console.log('🔧 Productos obtenidos:', productos)
      console.log('🔧 Primer producto:', productos[0])
      
      if (productos[0]) {
        console.log('🔧 Campos del primer producto:', Object.keys(productos[0]))
        console.log('🔧 Stock del primer producto:', (productos[0] as any).stock)
      }

      // 2. El stock ya está siendo actualizado correctamente en la base de datos
      // por el hook useSales, así que simplemente usamos el stock actual
      const inventario = (productos as ProductoRow[]).map(producto => {
        const stockActual = (producto as any).stock || 0
        console.log(`🔧 Producto ${producto.nombre}: stock actual=${stockActual}`)
        
        return {
          ...producto,
          stock: stockActual // Usar el stock actual de la base de datos
        }
      })

      console.log('🔧 Inventario calculado:', inventario)
      setInventory(inventario)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [org?.id])

  return {
    inventory,
    loading,
    error,
    reloadInventory: loadInventory
  }
}
