-- Script para arreglar el problema de UUID de organización
-- Ejecutar en el SQL Editor de Supabase

-- 1. Insertar la organización principal con UUID específico si no existe
INSERT INTO org (id, nombre, created_at, updated_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Organización Principal',
  NOW(),
  NOW()
) 
ON CONFLICT (id) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  updated_at = NOW();

-- 2. Actualizar todos los productos que tengan org_id = 'default' (si los hay)
UPDATE producto 
SET org_id = '550e8400-e29b-41d4-a716-446655440000' 
WHERE org_id = 'default';

-- 3. Actualizar todos los clientes que tengan org_id = 'default'
UPDATE cliente 
SET org_id = '550e8400-e29b-41d4-a716-446655440000' 
WHERE org_id = 'default';

-- 4. Actualizar todas las ventas que tengan org_id = 'default'
UPDATE venta 
SET org_id = '550e8400-e29b-41d4-a716-446655440000' 
WHERE org_id = 'default';

-- 5. Verificar que los cambios se aplicaron correctamente
SELECT 'Organización' as tabla, COUNT(*) as total FROM org WHERE id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'Productos' as tabla, COUNT(*) as total FROM producto WHERE org_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'Clientes' as tabla, COUNT(*) as total FROM cliente WHERE org_id = '550e8400-e29b-41d4-a716-446655440000'  
UNION ALL
SELECT 'Ventas' as tabla, COUNT(*) as total FROM venta WHERE org_id = '550e8400-e29b-41d4-a716-446655440000';
