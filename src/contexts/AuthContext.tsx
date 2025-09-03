// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, getCurrentUserWithRole } from '../lib/supabase'
import type { UserRole } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  org: { id: string; nombre: string } | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  hasPermission: (requiredRoles: UserRole[]) => boolean
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  org: null,
  loading: true,
  signIn: async () => ({ error: 'Not implemented' }),
  signOut: async () => {},
  hasPermission: () => false,
  refreshSession: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [org, setOrg] = useState<{ id: string; nombre: string } | null>(null)
  const [loading, setLoading] = useState(true)

  console.log('🔧 AuthProvider - Current state:', { user: !!user, role, loading })

  useEffect(() => {
    console.log('🔧 AuthProvider - useEffect iniciado')
    
    // Obtener sesión inicial con persistencia mejorada
    const getInitialSession = async () => {
      try {
        console.log('🔧 AuthProvider - Obteniendo sesión inicial...')
        
        // Verificar si hay una sesión válida
        const session = await supabase.auth.getSession()
        if (session.data.session?.user) {
          console.log('🔧 Sesión válida encontrada')
          setUser(session.data.session.user as any)
          
          // Intentar obtener datos adicionales
          try {
            const { user: currentUser, role: userRole, org: userOrg } = await getCurrentUserWithRole()
            if (currentUser && userRole && userOrg) {
              setUser(currentUser)
              setRole(userRole)
              setOrg(userOrg)
              console.log('✅ Datos completos del usuario obtenidos')
            } else {
              // Si no podemos obtener los datos adicionales, usar valores por defecto
              console.warn('⚠️ No se pudieron obtener datos adicionales, usando valores por defecto')
              setRole('cashier') // Rol por defecto
              setOrg({ id: 'default', nombre: 'Organización Principal' })
            }
          } catch (roleError) {
            console.warn('⚠️ Error obteniendo datos adicionales, usando valores por defecto:', roleError)
            // Mantener la sesión básica con valores por defecto
            setRole('cashier')
            setOrg({ id: 'default', nombre: 'Organización Principal' })
          }
          
          setLoading(false)
          return
        }
        
        // Si no hay sesión válida, mostrar login
        console.log('❌ No hay sesión válida, mostrando login')
        setUser(null)
        setRole(null)
        setOrg(null)
        setLoading(false)
        
      } catch (error) {
        console.error('❌ Error crítico en sesión inicial:', error)
        setUser(null)
        setRole(null)
        setOrg(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔧 Auth state change:', event, !!session)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user as any)
          
          try {
            const { user: currentUser, role: userRole, org: userOrg } = await getCurrentUserWithRole()
            if (currentUser && userRole && userOrg) {
              setUser(currentUser)
              setRole(userRole)
              setOrg(userOrg)
              console.log('✅ Login completo exitoso')
            } else {
              // Usar valores por defecto si no se pueden obtener
              setRole('cashier')
              setOrg({ id: 'default', nombre: 'Organización Principal' })
              console.log('✅ Login con valores por defecto')
            }
          } catch (error) {
            console.warn('⚠️ Error obteniendo datos adicionales en login:', error)
            setRole('cashier')
            setOrg({ id: 'default', nombre: 'Organización Principal' })
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔓 Usuario cerró sesión manualmente')
          setUser(null)
          setRole(null)
          setOrg(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('� Token refrescado - sesión manteniéndose')
          // No limpiar el estado en refresh de token
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔑 Intentando iniciar sesión...')
      
      // Limpiar cualquier sesión previa corrupta
      await supabase.auth.signOut()
      localStorage.clear()
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Error en login:', error.message)
        return { error: error.message }
      }

      console.log('✅ Login exitoso')
      // La actualización del estado se maneja en el listener onAuthStateChange
      return {}
    } catch (error) {
      console.error('❌ Error inesperado en login:', error)
      return { error: 'Error inesperado al iniciar sesión' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('🔓 Cerrando sesión...')
      
      // Limpiar localStorage antes de cerrar sesión
      localStorage.clear()
      
      await supabase.auth.signOut()
      
      // Asegurar que el estado se limpia
      setUser(null)
      setRole(null)
      setOrg(null)
      
      console.log('✅ Sesión cerrada y estado limpiado')
    } catch (error) {
      console.error('❌ Error signing out:', error)
      // Aún así limpiar el estado local
      localStorage.clear()
      setUser(null)
      setRole(null)
      setOrg(null)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!role) return false
    return requiredRoles.includes(role)
  }

  // Función para refrescar sesión cuando hay errores de autenticación
  const refreshSession = async () => {
    console.log('🔄 Refrescando sesión...')
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.log('❌ No se pudo refrescar la sesión, limpiando estado')
        setUser(null)
        setRole(null)
        setOrg(null)
        return
      }

      console.log('✅ Sesión refrescada exitosamente')
      setUser(session.user as any)
      
      // Intentar obtener datos adicionales
      try {
        const { user: currentUser, role: userRole, org: userOrg } = await getCurrentUserWithRole()
        if (currentUser && userRole && userOrg) {
          setUser(currentUser)
          setRole(userRole)
          setOrg(userOrg)
        } else {
          setRole('cashier')
          setOrg({ id: 'default', nombre: 'Organización Principal' })
        }
      } catch (roleError) {
        console.warn('⚠️ Error obteniendo datos adicionales en refresh:', roleError)
        setRole('cashier')
        setOrg({ id: 'default', nombre: 'Organización Principal' })
      }
    } catch (error) {
      console.error('❌ Error refrescando sesión:', error)
    }
  }

  const value: AuthContextType = {
    user,
    role,
    org,
    loading,
    signIn,
    signOut,
    hasPermission,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}