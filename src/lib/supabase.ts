// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

type UserRoleWithOrg = Database['public']['Tables']['user_role']['Row'] & {
  org: Database['public']['Tables']['org']['Row']
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase environment variables')
  console.error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
  // En lugar de hacer throw, usamos valores dummy para desarrollo
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
})

// Tipos de roles
export type UserRole = 'admin' | 'manager' | 'cashier'

// Función helper para obtener el usuario actual y su rol
export const getCurrentUserWithRole = async () => {
  try {
    console.log('🔍 Obteniendo usuario actual...')
    
    // Primero obtener el usuario con timeout más largo
    const userPromise = supabase.auth.getUser()
    const userTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout getting user')), 30000) // 30 segundos
    )
    
    const { data: { user }, error: userError } = await Promise.race([
      userPromise,
      userTimeout
    ]) as any
    
    if (userError || !user) {
      console.log('⚠️ No hay usuario autenticado:', userError?.message)
      return { user: null, role: null, org: null, error: userError }
    }

    console.log('✅ Usuario obtenido, consultando rol...')

    // Obtener el rol y la organización del usuario con timeout
    const rolePromise = supabase
      .from('user_role')
      .select<string, UserRoleWithOrg>('*, org!user_role_org_id_fkey(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    const roleTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout getting user role')), 30000) // 30 segundos
    )

    const { data, error } = await Promise.race([
      rolePromise,
      roleTimeout
    ]) as any

    if (error || !data) {
      console.log('⚠️ Error obteniendo rol del usuario:', error?.message)
      return { user, role: null, org: null, error }
    }

    console.log('✅ Rol obtenido:', data.role)
    return {
      user,
      role: data.role,
      org: data.org,
      error: null
    }
  } catch (error) {
    console.error('❌ Error en getCurrentUserWithRole:', error)
    return { 
      user: null, 
      role: null, 
      org: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}