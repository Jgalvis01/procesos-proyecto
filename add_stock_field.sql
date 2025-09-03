-- Agregar campo stock a la tabla producto
ALTER TABLE producto ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;

-- Comentario para documentar el campo
COMMENT ON COLUMN producto.stock IS 'Cantidad disponible en inventario';
