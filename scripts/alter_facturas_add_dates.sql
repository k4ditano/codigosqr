-- Crear la tabla facturas si no existe
CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    negocio_id INTEGER REFERENCES negocios(id),
    canje_id INTEGER REFERENCES canjes(id),
    monto_descuento DECIMAL(10,2) DEFAULT 25.00,
    monto_ingreso DECIMAL(10,2) DEFAULT 25.00,
    monto_total DECIMAL(10,2) DEFAULT 50.00,
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aceptacion TIMESTAMP,
    fecha_pago TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_facturas_negocio ON facturas(negocio_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_emision ON facturas(fecha_emision);

-- Actualizar las fechas existentes basadas en el estado actual
UPDATE facturas 
SET fecha_aceptacion = fecha_emision
WHERE estado IN ('aceptada', 'pagada')
AND fecha_aceptacion IS NULL;

UPDATE facturas 
SET fecha_pago = fecha_emision
WHERE estado = 'pagada'
AND fecha_pago IS NULL; 