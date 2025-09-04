// src/hooks/useSessionStatus.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface SessionStatus {
  isExpiringSoon: boolean
  timeLeft: number
  isExpired: boolean
  lastCheck: Date | null
}

export const useSessionStatus = () => {
  const { user } = useAuth()
  const [status, setStatus] = useState<SessionStatus>({
    isExpiringSoon: false,
    timeLeft: 0,
    isExpired: false,
    lastCheck: null
  })

  const checkSessionStatus = useCallback(async (): Promise<SessionStatus> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (!session || error) {
        return {
          isExpiringSoon: false,
          timeLeft: 0,
          isExpired: true,
          lastCheck: new Date()
        }
      }

      const expiresAt = session.expires_at
      if (!expiresAt) {
        return {
          isExpiringSoon: false,
          timeLeft: 0,
          isExpired: false,
          lastCheck: new Date()
        }
      }

      const now = Math.floor(Date.now() / 1000)
      const remaining = expiresAt - now
      
      // Considerar "expirando pronto" si quedan menos de 5 minutos
      const isExpiringSoon = remaining <= 300 && remaining > 0
      const isExpired = remaining <= 0

      return {
        isExpiringSoon,
        timeLeft: Math.max(0, remaining),
        isExpired,
        lastCheck: new Date()
      }
    } catch (error) {
      console.error('Error checking session status:', error)
      return {
        isExpiringSoon: false,
        timeLeft: 0,
        isExpired: true,
        lastCheck: new Date()
      }
    }
  }, [])

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔄 Intentando extender sesión...')
      
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('❌ Error extendiendo sesión:', error)
        return false
      }
      
      if (data.session) {
        console.log('✅ Sesión extendida exitosamente')
        // Actualizar el estado después de extender
        const newStatus = await checkSessionStatus()
        setStatus(newStatus)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Error inesperado extendiendo sesión:', error)
      return false
    }
  }, [checkSessionStatus])

  useEffect(() => {
    if (!user) {
      setStatus({
        isExpiringSoon: false,
        timeLeft: 0,
        isExpired: false,
        lastCheck: null
      })
      return
    }

    // Función para actualizar el estado
    const updateStatus = async () => {
      const newStatus = await checkSessionStatus()
      setStatus(newStatus)
    }

    // Verificar inmediatamente
    updateStatus()

    // Verificar cada 30 segundos cuando el usuario está activo
    const interval = setInterval(updateStatus, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [user, checkSessionStatus])

  return {
    ...status,
    refreshSession,
    checkStatus: checkSessionStatus
  }
}
