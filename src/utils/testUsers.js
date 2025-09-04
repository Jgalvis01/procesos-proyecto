// Script para crear usuarios de prueba manualmente
// Ejecutar este script en la consola del navegador cuando estés logueado como admin

async function createTestUsersDirectly() {
  // Datos de usuarios de prueba
  const testUsers = [
    {
      email: 'manager.demo@example.com',
      role: 'manager',
      fake_user_id: 'test-manager-id-001'
    },
    {
      email: 'cashier.demo@example.com', 
      role: 'cashier',
      fake_user_id: 'test-cashier-id-002'
    }
  ]

  console.log('🔧 Creando usuarios de prueba directamente en la DB...')

  for (const user of testUsers) {
    try {
      // Insertar directamente en user_role con IDs ficticios
      const { error } = await supabase
        .from('user_role')
        .insert({
          user_id: user.fake_user_id,
          role: user.role,
          org_id: 1,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error(`❌ Error creando ${user.role}:`, error)
      } else {
        console.log(`✅ Usuario ${user.role} creado: ${user.email}`)
        console.log(`   ID ficticio: ${user.fake_user_id}`)
      }
    } catch (error) {
      console.error(`❌ Error creando ${user.role}:`, error)
    }
  }

  console.log(`
📋 CREDENCIALES DE PRUEBA CREADAS:

Para probar diferentes roles, puedes:
1. Modificar temporalmente tu user_id en la tabla user_role
2. O crear una función de "cambio de rol" en el admin

ROLES CREADOS:
- Manager: test-manager-id-001
- Cashier: test-cashier-id-002

PERMISOS POR ROL:
- Manager: Ventas, Productos, Clientes, Inventario
- Cashier: Solo Ventas y Clientes
  `)
}

// Función para cambiar tu rol temporalmente (solo para pruebas)
async function switchToRole(role) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('❌ No hay usuario logueado')
    return
  }

  const { error } = await supabase
    .from('user_role')
    .update({ role: role })
    .eq('user_id', user.id)

  if (error) {
    console.error('❌ Error cambiando rol:', error)
  } else {
    console.log(`✅ Rol cambiado a: ${role}`)
    console.log('🔄 Recarga la página para ver los cambios')
  }
}

console.log(`
🛠️ UTILIDADES DE PRUEBA CARGADAS

Funciones disponibles:
- createTestUsersDirectly() - Crear usuarios de prueba
- switchToRole('manager') - Cambiar tu rol a manager
- switchToRole('cashier') - Cambiar tu rol a cashier  
- switchToRole('admin') - Volver a admin

Uso:
1. Abre la consola del navegador (F12)
2. Ejecuta: createTestUsersDirectly()
3. O cambia tu rol: switchToRole('manager')
`)

export { createTestUsersDirectly, switchToRole }
