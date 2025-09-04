import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import SessionStatusIndicator from '../SessionStatusIndicator'

const NavBar: React.FC = () => {
  const { user, signOut, role } = useAuth()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo o nombre de la app */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">POS System</span>
            </div>

            {/* Links de navegación */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${
                    isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `${
                    isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                }
              >
                Productos
              </NavLink>

              <NavLink
                to="/sales"
                className={({ isActive }) =>
                  `${
                    isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                }
              >
                Ventas
              </NavLink>

              <NavLink
                to="/inventory"
                className={({ isActive }) =>
                  `${
                    isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                }
              >
                Inventario
              </NavLink>

              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  `${
                    isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                }
              >
                Clientes
              </NavLink>
            </div>
          </div>

          {/* Menú de usuario */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              {/* Indicador de estado de sesión */}
              <SessionStatusIndicator />
              
              <span className="text-sm text-gray-500">
                {user?.email} ({role})
              </span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${
                isActive ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `${
                isActive ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`
            }
          >
            Productos
          </NavLink>

          <NavLink
            to="/sales"
            className={({ isActive }) =>
              `${
                isActive ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`
            }
          >
            Ventas
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `${
                isActive ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`
            }
          >
            Inventario
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `${
                isActive ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`
            }
          >
            Clientes
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
