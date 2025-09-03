#!/bin/bash

# Script de inicialización para POS_PROCESOS
echo "🚀 Configurando POS_PROCESOS..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"

# Verificar si npm está disponible
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está disponible."
    exit 1
fi

echo "✅ npm detectado: $(npm --version)"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Configura las variables de Supabase en el archivo .env"
else
    echo "✅ Archivo .env ya existe"
fi

# Verificar compilación
echo "🔍 Verificando compilación..."
npm run build

echo "🎉 ¡Configuración completada!"
echo ""
echo "Para iniciar el servidor de desarrollo:"
echo "  npm run dev"
echo ""
echo "Para obtener ayuda adicional, lee el README.md"
