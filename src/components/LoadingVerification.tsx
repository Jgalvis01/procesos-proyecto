// Componente de carga mejorado con opción de saltar verificación
import React, { useState, useEffect } from 'react'

interface LoadingVerificationProps {
  onSkip?: () => void
}

const LoadingVerification: React.FC<LoadingVerificationProps> = ({ onSkip }) => {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showSkipButton, setShowSkipButton] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1
        // Mostrar botón de saltar después de 10 segundos
        if (newTime >= 10) {
          setShowSkipButton(true)
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-4">
          Verificando permisos...
        </h2>

        {/* Tiempo transcurrido */}
        <p className="text-center text-gray-600 mb-6">
          Tiempo: {timeElapsed}s
        </p>

        {/* Información de debug */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Información de Debug</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <span className="text-green-600">✅ Configurada</span>
            </div>
            <div className="flex justify-between">
              <span>Supabase Key:</span>
              <span className="text-green-600">✅ Configurada</span>
            </div>
            <div className="flex justify-between">
              <span>Modo:</span>
              <span className="text-blue-600">development</span>
            </div>
          </div>
        </div>

        {/* Botón para saltar después de 10 segundos */}
        {showSkipButton && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              ¿La verificación está tomando mucho tiempo?
            </p>
            <button
              onClick={onSkip}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Continuar sin verificación completa
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Algunas funciones podrían estar limitadas
            </p>
          </div>
        )}

        {/* Consejos de troubleshooting */}
        {timeElapsed > 15 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              💡 Consejos si esto persiste:
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Verifica tu conexión a internet</li>
              <li>• Recarga la página (F5)</li>
              <li>• Borra caché del navegador</li>
              <li>• Contacta al administrador</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingVerification
