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

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('Error obteniendo sesión:', error)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          
          // Obtener datos adicionales con protección contra bucles
          getCurrentUserWithRole()
            .then(({ user: currentUser, role: userRole, org: userOrg }) => {
              if (!mounted) return
              
              console.log('🔍 AuthContext: Datos obtenidos:', { 
                hasUser: !!currentUser, 
                role: userRole, 
                hasOrg: !!userOrg 
              })
              
              if (currentUser) {
                setUser(currentUser)
                setRole(userRole || 'cashier')  // Default seguro
                setOrg(userOrg || { id: '1', nombre: 'Default Org' }) // Default seguro
              } else {
                console.log('⚠️ AuthContext: No se obtuvieron datos de usuario')
                setUser(session.user)
                setRole('cashier') // Default seguro
                setOrg({ id: '1', nombre: 'Default Org' })
              }
            })
            .catch((error) => {
              if (!mounted) return
              console.log('❌ AuthContext: Error obteniendo datos:', error)
              setRole('cashier')
              setOrg({ id: '1', nombre: 'Default Org' })
            })
        } else {
          setUser(null)
          setRole(null)
          setOrg(null)
        }
        
        setLoading(false)
        
      } catch (error) {
        console.error('Error en sesión inicial:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          
          getCurrentUserWithRole()
            .then(({ user: currentUser, role: userRole, org: userOrg }) => {
              if (!mounted) return
              if (currentUser && userRole && userOrg) {
                setUser(currentUser)
                setRole(userRole)
                setOrg(userOrg)
              } else {
                setRole('cashier')
                setOrg({ id: '550e8400-e29b-41d4-a716-446655440000', nombre: 'Organización Principal' })
              }
            })
            .catch(() => {
              if (mounted) {
                setRole('cashier')
                setOrg({ id: '550e8400-e29b-41d4-a716-446655440000', nombre: 'Organización Principal' })
              }
            })
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setRole(null)
          setOrg(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setLoading(false)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      setLoading(false)
      return { error: 'Error inesperado en el login' }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error al cerrar sesión:', error)
      }
      
      setUser(null)
      setRole(null)
      setOrg(null)
      setLoading(false)
    } catch (error) {
      console.error('Error cerrando sesión:', error)
      setLoading(false)
    }
  }

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!role) return false
    return requiredRoles.includes(role)
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Error refrescando sesión:', error)
      }
    } catch (error) {
      console.error('Error en refreshSession:', error)
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
