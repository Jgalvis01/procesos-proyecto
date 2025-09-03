// src/components/LoadingScreen.tsx
import React from 'react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Cargando aplicación..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-2">{message}</p>
        
        {/* Información de debug */}
        <div className="mt-8 max-w-md">
          <details className="bg-white rounded-lg shadow p-4">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Información de Debug
            </summary>
            <div className="mt-3 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span>Supabase URL:</span>
                <span className={import.meta.env.VITE_SUPABASE_URL ? "text-green-600" : "text-red-600"}>
                  {import.meta.env.VITE_SUPABASE_URL ? "✅ Configurada" : "❌ Faltante"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Supabase Key:</span>
                <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ Faltante"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Modo:</span>
                <span className="text-blue-600">{import.meta.env.MODE}</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
