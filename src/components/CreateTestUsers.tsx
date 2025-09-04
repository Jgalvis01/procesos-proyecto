// Utilidad para crear usuarios de prueba con diferentes roles
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const CreateTestUsers: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [manualPassword, setManualPassword] = useState('')
  const [manualRole, setManualRole] = useState<'manager' | 'cashier'>('manager')

  const createTestUser = async (email: string, password: string, role: 'admin' | 'manager' | 'cashier') => {
    try {
      console.log(`Intentando crear usuario: ${email} con rol: ${role}`)
      
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        console.error('Error de autenticación:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario')
      }

      console.log(`Usuario creado en Auth: ${authData.user.id}`)

      // 2. Crear entrada en user_role
      const { error: roleError } = await (supabase as any)
        .from('user_role')
        .insert({
          user_id: authData.user.id,
          role: role,
          org_id: 1, // Usando org_id por defecto
          created_at: new Date().toISOString()
        })

      if (roleError) {
        console.error('Error creando rol:', roleError)
        throw roleError
      }

      console.log(`Rol ${role} asignado correctamente`)
      return { success: true, message: `✅ Usuario ${role} creado exitosamente: ${email}` }
    } catch (error: any) {
      console.error(`Error completo creando ${role}:`, error)
      return { success: false, message: `❌ Error creando ${role}: ${error.message || 'Error desconocido'}` }
    }
  }

  const handleCreateTestUsers = async () => {
    setLoading(true)
    setMessage('Creando usuarios de prueba...')

    const testUsers = [
      { email: 'manager.test@gmail.com', password: 'Manager123!', role: 'manager' as const },
      { email: 'cashier.test@gmail.com', password: 'Cashier123!', role: 'cashier' as const }
    ]

    const results = []

    for (const user of testUsers) {
      const result = await createTestUser(user.email, user.password, user.role)
      results.push(result.message)
      console.log(result.message)
      // Esperar un poco entre cada creación
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setMessage(results.join('\n'))
    setLoading(false)
  }

  const handleManualCreate = async () => {
    if (!manualEmail || !manualPassword) {
      setMessage('❌ Por favor completa email y contraseña')
      return
    }

    setLoading(true)
    const result = await createTestUser(manualEmail, manualPassword, manualRole)
    setMessage(result.message)
    setLoading(false)
    
    if (result.success) {
      setManualEmail('')
      setManualPassword('')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Crear Usuarios de Prueba</h2>
      
      <div className="space-y-6">
        {/* Creación automática */}
        <div>
          <h3 className="font-semibold mb-2">Opción 1: Creación Automática</h3>
          <div className="text-sm text-gray-600 mb-3">
            <p><strong>Roles disponibles:</strong></p>
            <ul className="ml-4 mt-2">
              <li>• <strong>Admin:</strong> Acceso completo</li>
              <li>• <strong>Manager:</strong> Productos, Clientes, Inventario, Ventas</li>
              <li>• <strong>Cashier:</strong> Solo Ventas y Clientes</li>
            </ul>
          </div>

          <button
            onClick={handleCreateTestUsers}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 mb-2"
          >
            {loading ? 'Creando...' : 'Crear Usuarios de Prueba'}
          </button>

          <div className="text-xs text-gray-500">
            <p><strong>Credenciales que se crearán:</strong></p>
            <p>Manager: manager.test@gmail.com / Manager123!</p>
            <p>Cashier: cashier.test@gmail.com / Cashier123!</p>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Opción 2: Crear Usuario Manual</h3>
          
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email (ej: test@gmail.com)"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            
            <input
              type="password"
              placeholder="Contraseña (min 6 caracteres)"
              value={manualPassword}
              onChange={(e) => setManualPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
            
            <select
              value={manualRole}
              onChange={(e) => setManualRole(e.target.value as 'manager' | 'cashier')}
              className="w-full p-2 border rounded"
            >
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
            
            <button
              onClick={handleManualCreate}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-line">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateTestUsers
