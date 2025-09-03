-- SQL completo para arreglar todas las tablas del POS
-- Ejecutar en Supabase SQL Editor

-- ================================
-- 1. ARREGLAR TABLA PRODUCTO
-- ================================
-- Agregar campo stock si no existe
ALTER TABLE producto ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

-- Agregar campo activo para productos (en lugar de eliminar)
ALTER TABLE producto ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;

-- Comentarios descriptivos
COMMENT ON COLUMN producto.stock IS 'Cantidad disponible en inventario del producto';
COMMENT ON COLUMN producto.activo IS 'Indica si el producto está activo (true) o desactivado (false)';

-- ================================
-- 2. ARREGLAR TABLA VENTA
-- ================================
-- Agregar campo numero si no existe
ALTER TABLE venta ADD COLUMN IF NOT EXISTS numero VARCHAR(50) NOT NULL DEFAULT '';

-- Agregar campo total si no existe (para almacenar el total de la venta)
ALTER TABLE venta ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Comentarios descriptivos
COMMENT ON COLUMN venta.numero IS 'Número único de la venta (ej: VENTA-001)';
COMMENT ON COLUMN venta.total IS 'Monto total de la venta';

-- ================================
-- 3. VERIFICAR ESTRUCTURA DE VENTA_ITEM
-- ================================
-- Verificar que venta_item tenga todos los campos necesarios
-- Esta tabla debería tener: id, venta_id, producto_id, cantidad, precio_unitario

-- ================================
-- 4. GENERAR NÚMEROS DE VENTA PARA REGISTROS EXISTENTES
-- ================================
-- Si ya existen ventas sin número, generarles uno automáticamente
UPDATE venta 
SET numero = 'VENTA-' || LPAD(id::text, 6, '0')
WHERE numero = '' OR numero IS NULL;

-- ================================
-- 5. CREAR FUNCIÓN PARA AUTO-GENERAR NÚMEROS DE VENTA
-- ================================
-- Función que genera automáticamente el próximo número de venta
CREATE OR REPLACE FUNCTION generate_venta_numero()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    org_id_param TEXT;
BEGIN
    -- Obtener el org_id del contexto (si está disponible)
    org_id_param := current_setting('app.current_org_id', true);
    
    -- Obtener el siguiente número basado en el org_id o global
    IF org_id_param IS NOT NULL AND org_id_param != '' THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 'VENTA-(.*)') AS INTEGER)), 0) + 1
        INTO next_number
        FROM venta 
        WHERE org_id = org_id_param 
        AND numero ~ '^VENTA-[0-9]+$';
    ELSE
        SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 'VENTA-(.*)') AS INTEGER)), 0) + 1
        INTO next_number
        FROM venta 
        WHERE numero ~ '^VENTA-[0-9]+$';
    END IF;
    
    RETURN 'VENTA-' || LPAD(next_number::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 6. CREAR FUNCIÓN PARA ACTUALIZAR STOCK
-- ================================
CREATE OR REPLACE FUNCTION update_product_stock(product_id INTEGER, new_stock INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE producto 
    SET stock = new_stock 
    WHERE id = product_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 7. VERIFICAR RESULTADOS
-- ================================
-- Mostrar estructura de tabla producto
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'producto' 
ORDER BY ordinal_position;

-- Mostrar estructura de tabla venta
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'venta' 
ORDER BY ordinal_position;

-- Mostrar algunos productos para verificar el campo stock
SELECT id, codigo, nombre, precio, stock, created_at 
FROM producto 
LIMIT 3;

-- Mostrar algunas ventas para verificar el campo numero
SELECT id, org_id, cliente_id, numero, total, created_at 
FROM venta 
LIMIT 3;
