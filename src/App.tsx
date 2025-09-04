import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth'
import { Login } from './components/auth'
import { Layout } from './components/layout'
import SessionManager from './components/SessionManager'
import { Dashboard, Inventory } from './pages'
import ProductList from './pages/products/ProductList'
import CreateProduct from './pages/products/CreateProduct'
import EditProduct from './pages/products/EditProduct'
import Categories from './pages/products/Categories'
import CustomerList from './pages/customers/CustomerList'
import CreateCustomer from './pages/customers/CreateCustomer'
import EditCustomer from './pages/customers/EditCustomer'
import SalesList from './pages/sales/SalesList'
import CreateSale from './pages/sales/CreateSale'
import ErrorBoundary from './components/ErrorBoundary'
import ConfigurationError from './components/ConfigurationError'

function App() {
  // Debug: Mostrar información de las variables de entorno
  console.log('🔧 Debug - Environment variables:')
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing')

  // Verificar si las variables están configuradas correctamente (no sean las de ejemplo)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  const isConfigured = supabaseUrl && 
                      supabaseKey && 
                      !supabaseUrl.includes('ejemplo') &&
                      !supabaseKey.includes('ejemplo')

  if (!isConfigured) {
    return <ConfigurationError />
  }

  // Componente wrapper para Layout
  const LayoutWrapper = () => (
    <Layout>
      <Outlet />
    </Layout>
  )

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SessionManager>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
              <Routes>
                {/* Ruta pública */}
                <Route path="/login" element={<Login />} />

                {/* Rutas protegidas */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<LayoutWrapper />}>
                    {/* Ruta por defecto redirige al dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Dashboard */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Productos - con sub-rutas */}
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/create" element={<CreateProduct />} />
                    <Route path="/products/edit/:id" element={<EditProduct />} />
                    <Route path="/products/categories" element={<Categories />} />
                    
                    {/* Clientes - con sub-rutas */}
                    <Route path="/customers" element={<CustomerList />} />
                    <Route path="/customers/create" element={<CreateCustomer />} />
                    <Route path="/customers/edit/:id" element={<EditCustomer />} />
                    
                    {/* Ventas - con sub-rutas */}
                    <Route path="/sales" element={<SalesList />} />
                    <Route path="/sales/create" element={<CreateSale />} />
                    
                    {/* Inventario */}
                    <Route path="/inventory" element={<Inventory />} />
                  </Route>
                </Route>

                {/* Ruta 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </SessionManager>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App