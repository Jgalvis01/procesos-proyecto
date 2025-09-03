// Verificar si el campo stock existe en la tabla producto
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gqojhkbmkqnvvosvcfhm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxb2poa2Jta3Fudnb2c3ZjZmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNzU3MDYsImV4cCI6MjA0MDk1MTcwNn0.jxPDXG-AK6_lc1ooVpJ8vEMKXYFKYsjTfLcbSkuD-2Y'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProductTableStructure() {
  console.log('🔍 Verificando estructura de tabla producto...')
  
  try {
    // Obtener un producto existente para ver la estructura
    const { data: productos, error } = await supabase
      .from('producto')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error consultando productos:', error)
      return
    }
    
    if (productos && productos.length > 0) {
      console.log('📋 Campos disponibles:', Object.keys(productos[0]))
      
      if ('stock' in productos[0]) {
        console.log('✅ El campo stock EXISTE')
        console.log('📊 Valor actual del stock:', productos[0].stock)
      } else {
        console.log('❌ El campo stock NO EXISTE')
        console.log('👉 Necesitas ejecutar este SQL en Supabase:')
        console.log('   ALTER TABLE producto ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;')
      }
    } else {
      console.log('⚠️ No hay productos en la tabla para verificar la estructura')
      
      // Intentar insertar un producto de prueba para ver qué falla
      console.log('🧪 Intentando crear un producto de prueba...')
      const { error: insertError } = await supabase
        .from('producto')
        .insert({
          codigo: 'TEST_STOCK',
          nombre: 'Producto Test Stock',
          precio: 100,
          stock: 50,
          org_id: 'test-org-id'
        })
      
      if (insertError) {
        console.log('❌ Error insertando producto de prueba:', insertError)
        if (insertError.message.includes('stock')) {
          console.log('👉 Confirma: el campo STOCK NO EXISTE')
        }
      } else {
        console.log('✅ Producto de prueba creado con stock')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkProductTableStructure()
