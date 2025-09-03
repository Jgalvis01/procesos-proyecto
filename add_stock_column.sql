-- SQL para ejecutar en Supabase SQL Editor
-- Agregar campo stock a la tabla producto

-- 1. Agregar la columna stock
ALTER TABLE producto ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

-- 2. Crear índice para búsquedas por stock
CREATE INDEX IF NOT EXISTS idx_producto_stock ON producto(stock);

-- 3. Agregar comentario descriptivo
COMMENT ON COLUMN producto.stock IS 'Cantidad disponible en inventario del producto';

-- 4. Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'producto' 
ORDER BY ordinal_position;

-- 5. Mostrar algunos productos para verificar el campo
SELECT id, codigo, nombre, precio, stock, created_at 
FROM producto 
LIMIT 5;
