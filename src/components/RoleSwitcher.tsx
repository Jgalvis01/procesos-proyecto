// Componente simple para cambiar roles temporalmente y probar el sistema
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const RoleSwitcher: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user, role } = useAuth()

  const switchRole = async (newRole: 'admin' | 'manager' | 'cashier') => {
    if (!user) {
      setMessage('❌ No hay usuario logueado')
      return
    }

    setLoading(true)
    setMessage('🔄 Cambiando rol...')

    try {
      const { error } = await (supabase as any)
        .from('user_role')
        .update({ role: newRole })
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      setMessage(`✅ Rol cambiado a: ${newRole}. Recarga la página para ver los cambios.`)
      
      // Auto-recargar después de 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error: any) {
      setMessage(`❌ Error cambiando rol: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-yellow-800">🧪 Cambiar Rol (Solo Pruebas)</h2>
      
      <div className="mb-4 p-3 bg-yellow-100 rounded text-sm">
        <p><strong>Rol actual:</strong> {role}</p>
        <p><strong>Usuario:</strong> {user?.email}</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-700 mb-4">
          Cambia temporalmente tu rol para probar diferentes niveles de acceso:
        </p>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => switchRole('admin')}
            disabled={loading || role === 'admin'}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
          >
            🔴 Cambiar a Admin
          </button>
          
          <button
            onClick={() => switchRole('manager')}
            disabled={loading || role === 'manager'}
            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            🟡 Cambiar a Manager
          </button>
          
          <button
            onClick={() => switchRole('cashier')}
            disabled={loading || role === 'cashier'}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            🟢 Cambiar a Cashier
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-white rounded text-sm border">
            {message}
          </div>
        )}

        <div className="text-xs text-gray-600 mt-4">
          <p><strong>Qué verás en cada rol:</strong></p>
          <ul className="ml-4 mt-1">
            <li>• <strong>Admin:</strong> Todo + herramientas de admin</li>
            <li>• <strong>Manager:</strong> Ventas, productos, clientes, inventario</li>
            <li>• <strong>Cashier:</strong> Solo ventas y clientes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RoleSwitcher
