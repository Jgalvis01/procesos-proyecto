// src/config/session.ts

export interface SessionConfig {
  // Tiempo en segundos antes de la expiración para mostrar advertencia
  warningThreshold: number
  // Intervalo de verificación en milisegundos
  checkInterval: number
  // Tiempo en segundos para considerar como "crítico"
  criticalThreshold: number
  // Habilitar logs de debug
  enableDebugLogs: boolean
}

export const sessionConfig: SessionConfig = {
  // Mostrar advertencia 5 minutos antes (300 segundos)
  warningThreshold: 300,
  // Verificar cada 30 segundos
  checkInterval: 30000,
  // Crítico en los últimos 2 minutos (120 segundos)
  criticalThreshold: 120,
  // Logs habilitados en desarrollo
  enableDebugLogs: import.meta.env.DEV
}

export const logSessionEvent = (message: string, data?: any) => {
  if (sessionConfig.enableDebugLogs) {
    console.log(`[SessionManager] ${message}`, data || '')
  }
}
