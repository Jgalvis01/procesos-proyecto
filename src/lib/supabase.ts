// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { dbConfig, logDbEvent } from '../config/database'

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
    detectSessionInUrl: false,
    storage: localStorage,
    storageKey: 'pos-supabase-auth-token',
    flowType: 'pkce',
    debug: false
  },
  db: {
    schema: 'public'
  },
  // Configuración global para requests más lentos
  global: {
    headers: {
      'x-client-info': 'pos-system-v1',
    },
  }
})

// Tipos de roles
export type UserRole = 'admin' | 'manager' | 'cashier'

// Función helper para obtener el usuario actual y su rol (simplificada sin timeouts agresivos)
export const getCurrentUserWithRole = async () => {
  try {
    logDbEvent('🔍 Obteniendo usuario actual...')
    
    // Obtener sesión sin timeout agresivo
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      logDbEvent('⚠️ Error obteniendo sesión', sessionError.message)
      return { user: null, role: null, org: null, error: sessionError }
    }
    
    if (!session?.user) {
      logDbEvent('⚠️ No hay sesión válida')
      return { user: null, role: null, org: null, error: new Error('No active session') }
    }

    const user = session.user
    logDbEvent('✅ Usuario obtenido de sesión, consultando rol...')

    // Obtener rol sin timeout agresivo
    try {
      logDbEvent('🔍 Consultando rol para usuario:', user.id)
      
      // Consulta simplificada sin org y sin is_active
      const { data: roleData, error: roleError } = await (supabase as any)
        .from('user_role')
        .select('role, org_id')
        .eq('user_id', user.id)
        .single()

      if (roleError) {
        logDbEvent('⚠️ Error en consulta de rol:', roleError.message)
        logDbEvent('📝 Detalles del error:', JSON.stringify(roleError, null, 2))
        
        // Si es un error de "no encontrado", usar valores por defecto
        if (roleError.code === 'PGRST116' || roleError.message?.includes('No rows')) {
          logDbEvent('👤 Usuario sin rol asignado, usando valores por defecto')
        }
        
        return { 
          user, 
          role: dbConfig.defaultRole as UserRole, 
          org: dbConfig.defaultOrg, 
          error: null 
        }
      }

      if (!roleData) {
        logDbEvent('⚠️ No hay datos de rol, usando valores por defecto')
        return { 
          user, 
          role: dbConfig.defaultRole as UserRole, 
          org: dbConfig.defaultOrg, 
          error: null 
        }
      }

      logDbEvent('✅ Datos de rol obtenidos:', JSON.stringify(roleData, null, 2))
      return {
        user,
        role: roleData.role as UserRole,
        org: dbConfig.defaultOrg, // Usar org por defecto por ahora
        error: null
      }
    } catch (error) {
      logDbEvent('⚠️ Excepción en consulta de rol, usando valores por defecto', error)
      return { 
        user, 
        role: dbConfig.defaultRole as UserRole, 
        org: dbConfig.defaultOrg, 
        error: null 
      }
    }
  } catch (error) {
    logDbEvent('❌ Error crítico en getCurrentUserWithRole', error)
    return { 
      user: null, 
      role: null, 
      org: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    }
  }
}