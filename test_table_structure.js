// Verificar estructura de tabla producto
const testQuery = async () => {
  const { data, error } = await supabase
    .from('producto')
    .select('*')
    .limit(1)
  
  if (data && data.length > 0) {
    console.log('Campos disponibles en tabla producto:', Object.keys(data[0]))
  }
}

testQuery()
