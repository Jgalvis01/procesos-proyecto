// Script para crear una venta de prueba
// Para ejecutar en la consola del navegador después de iniciar sesión

const crearVentaDePrueba = async () => {
  console.log('🔧 === CREANDO VENTA DE PRUEBA ===')
  
  try {
    // 1. Verificar sesión
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.log('❌ No hay sesión activa')
      return
    }

    // 2. Obtener organización del usuario
    const { data: userRole } = await supabase
      .from('user_role')
      .select('org_id')
      .single()
    
    if (!userRole) {
      console.log('❌ No se encontró organización del usuario')
      return
    }

    // 3. Obtener un producto para la venta
    const { data: productos } = await supabase
      .from('producto')
      .select('id, nombre, precio')
      .eq('org_id', userRole.org_id)
      .limit(1)

    if (!productos || productos.length === 0) {
      console.log('❌ No hay productos disponibles')
      return
    }

    const producto = productos[0]
    console.log('✅ Producto seleccionado:', producto)

    // 4. Crear la venta
    const ventaData = {
      org_id: userRole.org_id,
      cliente_id: null, // Cliente general
      numero: `VENTA-${Date.now()}`,
      total: producto.precio * 2 // Cantidad 2
    }

    console.log('🔧 Creando venta con datos:', ventaData)

    const { data: venta, error: ventaError } = await supabase
      .from('venta')
      .insert(ventaData)
      .select()
      .single()

    if (ventaError) {
      console.error('❌ Error creando venta:', ventaError)
      return
    }

    console.log('✅ Venta creada:', venta)

    // 5. Crear items de la venta
    const ventaItemData = {
      venta_id: venta.id,
      producto_id: producto.id,
      cantidad: 2,
      precio_unitario: producto.precio
    }

    console.log('🔧 Creando item de venta:', ventaItemData)

    const { error: itemError } = await supabase
      .from('venta_item')
      .insert(ventaItemData)

    if (itemError) {
      console.error('❌ Error creando item de venta:', itemError)
      // Limpiar la venta si falla el item
      await supabase.from('venta').delete().eq('id', venta.id)
      return
    }

    console.log('✅ Venta de prueba creada exitosamente!')
    console.log('Detalles:', {
      ventaId: venta.id,
      numero: venta.numero,
      total: venta.total,
      producto: producto.nombre,
      cantidad: 2
    })

    // 6. Verificar que se puede consultar
    const { data: verificacion } = await supabase
      .from('venta')
      .select('*')
      .eq('id', venta.id)
      .single()

    console.log('✅ Verificación - venta consultada:', verificacion)

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Para ejecutar en consola del navegador:
// crearVentaDePrueba()
