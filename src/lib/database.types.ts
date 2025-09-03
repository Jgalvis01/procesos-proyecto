// src/lib/database.types.ts
export interface Database {
  public: {
    Tables: {
      org: {
        Row: {
          id: string
          nombre: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          created_at?: string
        }
      }
      user_role: {
        Row: {
          user_id: string
          org_id: string
          role: 'admin' | 'manager' | 'cashier'
          is_active: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          org_id: string
          role: 'admin' | 'manager' | 'cashier'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          org_id?: string
          role?: 'admin' | 'manager' | 'cashier'
          is_active?: boolean
          created_at?: string
        }
      }
      cliente: {
        Row: {
          id: number
          org_id: string
          nombre: string
          tipo_id: string | null
          idnum: string | null
          correo: string | null
          created_at: string
        }
        Insert: {
          id?: number
          org_id: string
          nombre: string
          tipo_id?: string | null
          idnum?: string | null
          correo?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          org_id?: string
          nombre?: string
          tipo_id?: string | null
          idnum?: string | null
          correo?: string | null
          created_at?: string
        }
      }
      producto: {
        Row: {
          id: number
          org_id: string
          codigo: string
          nombre: string
          precio: number
          stock: number
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          org_id: string
          codigo: string
          nombre: string
          precio: number
          stock?: number
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          org_id?: string
          codigo?: string
          nombre?: string
          precio?: number
          stock?: number
          activo?: boolean
          created_at?: string
        }
      }
      venta: {
        Row: {
          id: number
          org_id: string
          cliente_id: number | null
          numero: string
          total: number
          created_at: string
        }
        Insert: {
          id?: number
          org_id: string
          cliente_id?: number | null
          numero?: string
          total?: number
          created_at?: string
        }
        Update: {
          id?: number
          org_id?: string
          cliente_id?: number | null
          numero?: string
          total?: number
          created_at?: string
        }
      }
      venta_item: {
        Row: {
          id: number
          venta_id: number
          producto_id: number
          cantidad: number
          precio_unitario: number
          created_at: string
        }
        Insert: {
          id?: number
          venta_id: number
          producto_id: number
          cantidad: number
          precio_unitario: number
          created_at?: string
        }
        Update: {
          id?: number
          venta_id?: number
          producto_id?: number
          cantidad?: number
          precio_unitario?: number
          created_at?: string
        }
      }
    }
  }
}

// Tipos adicionales para el frontend
export type Cliente = Database['public']['Tables']['cliente']['Row']
export type Producto = Database['public']['Tables']['producto']['Row']
export type Venta = Database['public']['Tables']['venta']['Row']
export type VentaItem = Database['public']['Tables']['venta_item']['Row']
export type Org = Database['public']['Tables']['org']['Row']
export type UserRole = 'admin' | 'manager' | 'cashier'

// Tipos para inserciones
export type ClienteInsert = Database['public']['Tables']['cliente']['Insert']
export type ProductoInsert = Database['public']['Tables']['producto']['Insert']
export type VentaInsert = Database['public']['Tables']['venta']['Insert']
export type VentaItemInsert = Database['public']['Tables']['venta_item']['Insert']

// Tipo extendido para ventas con items
export interface VentaConItems extends Venta {
  cliente?: Cliente | null
  venta_item: (VentaItem & {
    producto: Producto
  })[]
}