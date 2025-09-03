// src/components/ConfigurationError.tsx
import React from 'react'

const ConfigurationError: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.12 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Configuración Requerida
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Las variables de entorno de Supabase no están configuradas.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Variables Faltantes:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <code className="text-gray-700">VITE_SUPABASE_URL</code>
              <span className={import.meta.env.VITE_SUPABASE_URL ? "text-green-600" : "text-red-600"}>
                {import.meta.env.VITE_SUPABASE_URL ? "✅" : "❌"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <code className="text-gray-700">VITE_SUPABASE_ANON_KEY</code>
              <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅" : "❌"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Pasos para Configurar:
          </h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Crea un archivo <code className="bg-blue-100 px-1 rounded">.env</code> en la raíz del proyecto</li>
            <li>2. Agrega tus credenciales de Supabase:</li>
          </ol>
          <div className="mt-2 bg-blue-100 p-2 rounded text-xs font-mono">
            VITE_SUPABASE_URL=tu_url_de_supabase<br />
            VITE_SUPABASE_ANON_KEY=tu_clave_anonima
          </div>
          <p className="mt-2 text-xs text-blue-600">
            3. Reinicia el servidor de desarrollo
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-6 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Recargar después de configurar
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>
            ¿Necesitas ayuda? Revisa la documentación en el{' '}
            <code className="bg-gray-100 px-1 rounded">README.md</code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConfigurationError
