// Script de debugging para revisar ventas
// Ejecutar en la consola del navegador

// Verificar estado de la aplicación
console.log('🔧 === DEBUG VENTAS ===')

// 1. Verificar que Supabase está funcionando
import { supabase } from './src/lib/supabase.ts'

// 2. Verificar sesión actual
const verificarSesion = async () => {
  console.log('🔧 Verificando sesión...')
  const { data: { session }, error } = await supabase.auth.getSession()
  console.log('Sesión actual:', { hasSession: !!session, error, userId: session?.user?.id })
  return session
}

// 3. Verificar organización del usuario
const verificarOrg = async () => {
  console.log('🔧 Verificando organización...')
  const { data, error } = await supabase
    .from('user_role')
    .select('org_id, role, org:org_id(nombre)')
    .single()
  console.log('Organización:', { data, error })
  return data
}

// 4. Consultar ventas directamente
const consultarVentas = async (orgId) => {
  console.log('🔧 Consultando ventas para org:', orgId)
  const { data, error } = await supabase
    .from('venta')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  
  console.log('Ventas encontradas:', { data, error, count: data?.length || 0 })
  return data
}

// 5. Ejecutar verificación completa
const debugCompleto = async () => {
  try {
    const session = await verificarSesion()
    if (!session) {
      console.log('❌ No hay sesión activa')
      return
    }
    
    const orgData = await verificarOrg()
    if (!orgData) {
      console.log('❌ No se encontró organización del usuario')
      return
    }
    
    const ventas = await consultarVentas(orgData.org_id)
    
    console.log('🔧 === RESUMEN DEBUG ===')
    console.log('Usuario autenticado:', !!session)
    console.log('Organización:', orgData.org?.nombre || 'Sin nombre')
    console.log('ID Organización:', orgData.org_id)
    console.log('Rol:', orgData.role)
    console.log('Total ventas:', ventas?.length || 0)
    
    if (ventas && ventas.length > 0) {
      console.log('Muestra de ventas:', ventas.slice(0, 3))
    }
    
  } catch (err) {
    console.error('❌ Error en debug:', err)
  }
}

// Ejecutar
debugCompleto()
