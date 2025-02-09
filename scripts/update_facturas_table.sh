#!/bin/bash

# Cargar variables de entorno desde .env
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Valores por defecto si no están en .env
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-codigosqr}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Recreando tabla facturas..."

# SQL para actualizar las tablas
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME << EOF
BEGIN;

-- Eliminar tabla facturas si existe
DROP TABLE IF EXISTS facturas CASCADE;

-- Crear tabla facturas
CREATE TABLE facturas (
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

-- Crear índices
CREATE INDEX idx_facturas_negocio ON facturas(negocio_id);
CREATE INDEX idx_facturas_estado ON facturas(estado);
CREATE INDEX idx_facturas_fecha_emision ON facturas(fecha_emision);

COMMIT;
EOF

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
    echo "✅ Tabla facturas recreada exitosamente"
else
    echo "❌ Error al recrear la tabla facturas"
    exit 1
fi 