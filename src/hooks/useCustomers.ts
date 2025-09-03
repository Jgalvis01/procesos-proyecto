// src/hooks/useCustomers.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../lib/database.types'

type Cliente = Database['public']['Tables']['cliente']['Row']
type ClienteInsert = Database['public']['Tables']['cliente']['Insert']
type ClienteUpdate = Database['public']['Tables']['cliente']['Update']

// Helper function to handle Supabase types
async function insertCliente(data: ClienteInsert) {
  // @ts-ignore - Known Supabase typing issue
  return supabase.from('cliente').insert(data).select().single()
}

// Helper function to handle Supabase types
async function updateCliente(data: ClienteUpdate, id: number) {
  // @ts-ignore - Known Supabase typing issue
  return supabase.from('cliente').update(data).eq('id', id)
}

export interface ClienteFormData {
  nombre: string
  tipo_id?: string | null
  idnum?: string | null
  correo?: string | null
}

interface UseCustomersReturn {
  customers: Cliente[]
  loading: boolean
  error: string | null
  createCustomer: (data: ClienteFormData) => Promise<{ success: boolean; error?: string; customer?: Cliente }>
  updateCustomer: (id: number, data: ClienteFormData) => Promise<{ success: boolean; error?: string }>
  deleteCustomer: (id: number) => Promise<{ success: boolean; error?: string }>
  refreshCustomers: () => Promise<void>
  searchCustomers: (query: string) => Cliente[]
}

export const useCustomers = (): UseCustomersReturn => {
  const { org } = useAuth()
  const [customers, setCustomers] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar clientes
  const loadCustomers = async () => {
    if (!org?.id) {
      setCustomers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('cliente')
        .select('*')
        .eq('org_id', org.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setCustomers(data || [])
    } catch (err) {
      setError('Error cargando clientes')
      console.error('Error loading customers:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes al montar el componente o cambiar la organización
  useEffect(() => {
    loadCustomers()
  }, [org?.id])

  // Crear cliente
  const createCustomer = async (data: ClienteFormData): Promise<{ success: boolean; error?: string; customer?: Cliente }> => {
    console.log('🔧 useCustomers - createCustomer llamado con:', data)
    
    if (!org?.id) {
      console.error('❌ No hay organización seleccionada')
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      const customerData: ClienteInsert = {
        ...data,
        org_id: org.id,
        // Convertir strings vacíos a null
        tipo_id: data.tipo_id?.trim() || null,
        idnum: data.idnum?.trim() || null,
        correo: data.correo?.trim() || null,
      }

      console.log('🔧 Datos de cliente a insertar:', customerData)
      const { data: insertedData, error: insertError } = await insertCliente(customerData)

      if (insertError) {
        console.error('❌ Error insertando cliente:', insertError)
        return { success: false, error: insertError.message }
      }

      console.log('✅ Cliente insertado exitosamente:', insertedData)
      // Recargar clientes después de crear
      await loadCustomers()
      return { success: true, customer: insertedData }
    } catch (err) {
      console.error('❌ Error creating customer:', err)
      return { success: false, error: 'Error inesperado al crear el cliente' }
    }
  }

  // Actualizar cliente
  const updateCustomer = async (id: number, data: ClienteFormData): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      const updateData: ClienteUpdate = {
        ...data,
        // Convertir strings vacíos a null
        tipo_id: data.tipo_id?.trim() || null,
        idnum: data.idnum?.trim() || null,
        correo: data.correo?.trim() || null,
      }

      const { error: updateError } = await updateCliente(updateData, id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      // Recargar clientes después de actualizar
      await loadCustomers()
      return { success: true }
    } catch (err) {
      console.error('Error updating customer:', err)
      return { success: false, error: 'Error inesperado al actualizar el cliente' }
    }
  }

  // Eliminar cliente
  const deleteCustomer = async (id: number): Promise<{ success: boolean; error?: string }> => {
    if (!org?.id) {
      return { success: false, error: 'No hay organización seleccionada' }
    }

    try {
      const { error: deleteError } = await supabase
        .from('cliente')
        .delete()
        .eq('id', id)
        .eq('org_id', org.id) // Asegurar que solo elimine clientes de la org

      if (deleteError) {
        // Verificar si hay ventas asociadas
        if (deleteError.code === '23503') {
          return { success: false, error: 'No se puede eliminar el cliente porque tiene ventas asociadas' }
        }
        return { success: false, error: deleteError.message }
      }

      // Recargar clientes después de eliminar
      await loadCustomers()
      return { success: true }
    } catch (err) {
      console.error('Error deleting customer:', err)
      return { success: false, error: 'Error inesperado al eliminar el cliente' }
    }
  }

  // Refrescar clientes
  const refreshCustomers = async () => {
    await loadCustomers()
  }

  // Buscar clientes
  const searchCustomers = (query: string): Cliente[] => {
    if (!query.trim()) {
      return customers
    }

    const lowercaseQuery = query.toLowerCase().trim()
    
    return customers.filter(customer =>
      customer.nombre.toLowerCase().includes(lowercaseQuery) ||
      (customer.idnum && customer.idnum.toLowerCase().includes(lowercaseQuery)) ||
      (customer.correo && customer.correo.toLowerCase().includes(lowercaseQuery))
    )
  }

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers,
    searchCustomers,
  }
}