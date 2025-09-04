// src/config/database.ts
export const dbConfig = {
  // Timeouts más generosos para sesiones de larga duración
  queryTimeout: 10000,     // 10 segundos para queries
  sessionTimeout: 15000,   // 15 segundos para obtener sesión
  retryAttempts: 3,        // Más intentos de reintento
  retryDelay: 2000,        // Más tiempo entre reintentos

  // Configuración de sesión extendida
  sessionDuration: 3600,   // 3600 segundos (1 hora)
  autoRefresh: true,       // Refrescar automáticamente
  refreshBuffer: 300,      // Refrescar 5 minutos antes del vencimiento

  // Configuración de fallbacks
  useDefaultValues: true,  // Usar valores por defecto en caso de timeout
  defaultRole: 'cashier',  // Rol por defecto
  defaultOrg: {
    id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido para organización por defecto
    nombre: 'Organización Principal'
  },

  // Configuración de logs
  logTimeouts: true,
  logRetries: true
}

// Helper para logs de base de datos (simplificado para evitar recursión)
export const logDbEvent = (message: string, data?: any) => {
  try {
    const timestamp = new Date().toLocaleTimeString()
    if (data && typeof data === 'object') {
      console.log(`[${timestamp}] 🗄️ ${message}`, data)
    } else {
      console.log(`[${timestamp}] 🗄️ ${message}${data ? ` ${data}` : ''}`)
    }
  } catch (error) {
    // Si hay error en el log, no hacer nada para evitar recursión
    console.log(`[DB LOG ERROR] ${message}`)
  }
}

// Helper para manejar timeouts con reintentos
export const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  attempts: number = dbConfig.retryAttempts
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await operation()
      if (i > 0) {
        logDbEvent(`✅ ${operationName} exitoso en intento ${i + 1}`)
      }
      return result
    } catch (error) {
      const isLastAttempt = i === attempts - 1
      
      if (isLastAttempt) {
        logDbEvent(`❌ ${operationName} falló después de ${attempts} intentos`, error)
        throw error
      } else {
        logDbEvent(`⚠️ ${operationName} falló en intento ${i + 1}, reintentando...`)
        await new Promise(resolve => setTimeout(resolve, dbConfig.retryDelay))
      }
    }
  }
  
  throw new Error(`Unexpected error in withRetry for ${operationName}`)
}

// Helper para timeouts con fallback
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue?: T,
  operationName?: string
): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) =>
    setTimeout(() => {
      const errorMsg = `Timeout después de ${timeoutMs}ms${operationName ? ` para ${operationName}` : ''}`
      reject(new Error(errorMsg))
    }, timeoutMs)
  )

  return Promise.race([promise, timeoutPromise]).catch(error => {
    if (fallbackValue !== undefined) {
      logDbEvent(`⚠️ Usando fallback para ${operationName || 'operación'}`, fallbackValue)
      return fallbackValue
    }
    throw error
  })
}
