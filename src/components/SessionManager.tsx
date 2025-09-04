import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface SessionManagerProps {
  children: React.ReactNode
}

export const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const [showExpirationWarning, setShowExpirationWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!user) return

    let checkTimer: NodeJS.Timeout
    let refreshTimer: NodeJS.Timeout

    const checkSessionExpiry = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.warn('⚠️ No hay sesión válida')
          return
        }

        if (session.expires_at) {
          const now = Math.floor(Date.now() / 1000)
          const remaining = session.expires_at - now
          
          console.log(`🕐 Tiempo restante: ${remaining} segundos`)
          setTimeLeft(remaining)
          
          // Refrescar automáticamente cuando quedan 15 minutos (900 segundos)
          if (remaining <= 900 && remaining > 600) {
            console.log('🔄 Refrescando sesión automáticamente...')
            await supabase.auth.refreshSession()
          }
          
          // Mostrar advertencia si quedan menos de 10 minutos
          if (remaining <= 600 && remaining > 0) {
            setShowExpirationWarning(true)
          } else if (remaining <= 0) {
            setShowExpirationWarning(true)
          } else {
            setShowExpirationWarning(false)
          }
        }
      } catch (error) {
        console.error('Error verificando sesión:', error)
      }
    }

    // Verificar cada 1 minuto para mejor control
    checkTimer = setInterval(checkSessionExpiry, 60000)
    checkSessionExpiry()

    // Refrescar automáticamente cada 30 minutos para mantener la sesión activa
    refreshTimer = setInterval(async () => {
      try {
        console.log('🔄 Refresco automático de sesión...')
        await supabase.auth.refreshSession()
        console.log('✅ Sesión refrescada automáticamente')
      } catch (error) {
        console.error('Error en refresco automático:', error)
      }
    }, 1800000) // 30 minutos

    return () => {
      if (checkTimer) clearInterval(checkTimer)
      if (refreshTimer) clearInterval(refreshTimer)
    }
  }, [user])

  const handleExtendSession = async () => {
    try {
      console.log('🔄 Extendiendo sesión...')
      await supabase.auth.refreshSession()
      console.log('✅ Sesión extendida')
      setShowExpirationWarning(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleLogout = async () => {
    console.log('🔓 Cerrando sesión')
    await signOut()
    setShowExpirationWarning(false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {children}
      {showExpirationWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Sesión por Expirar
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Su sesión expirará en {formatTime(timeLeft)}. ¿Desea continuar?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleExtendSession}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Continuar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SessionManager
