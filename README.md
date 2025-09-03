# POS_PROCESOS - Sistema de Punto de Venta

Sistema de punto de venta desarrollado con React + TypeScript + Vite + Supabase.

## Características

- ✅ Autenticación de usuarios con roles (admin, manager, cashier)
- ✅ Gestión de productos e inventario
- ✅ Gestión de clientes
- ✅ Procesamiento de ventas
- ✅ Dashboard con métricas
- ✅ Interfaz responsive con Tailwind CSS

## Configuración del Proyecto

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- Cuenta de Supabase

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/marco2712/POS_PROCESOS.git
cd POS_PROCESOS
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env`
   - Actualiza las variables con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run lint` - Ejecuta ESLint para revisar el código
- `npm run preview` - Vista previa de la aplicación construida

## Tecnologías Utilizadas

- **React** - Biblioteca de interfaz de usuario
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Herramienta de construcción rápida
- **Supabase** - Backend como servicio (BaaS)
- **React Router** - Enrutamiento del lado del cliente
- **Tailwind CSS** - Framework de utilidades CSS

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Componentes de autenticación
│   ├── customers/      # Componentes de clientes
│   ├── inventory/      # Componentes de inventario
│   ├── products/       # Componentes de productos
│   └── sales/          # Componentes de ventas
├── contexts/           # Contextos de React
├── hooks/              # Hooks personalizados
├── lib/                # Configuraciones y utilidades
├── pages/              # Páginas principales
└── utils/              # Funciones de utilidad
```

## Estado del Proyecto

✅ **Sin errores de compilación**
✅ **ESLint configurado correctamente**
✅ **TypeScript configurado sin errores**
✅ **Servidor de desarrollo funcionando**

⚠️ **Pendiente**: Configurar variables de entorno de Supabase

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
