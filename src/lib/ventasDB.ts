import { supabase } from './supabase'

export const ventasDB = {
  async insertVenta(venta: any) {
    return (supabase as any)
      .from('venta')
      .insert(venta)
      .select()
      .single()
  },

  async insertVentaItems(items: any[]) {
    return (supabase as any)
      .from('venta_item')
      .insert(items)
  },

  async deleteVenta(id: number) {
    return (supabase as any)
      .from('venta')
      .delete()
      .eq('id', id)
  }
}
