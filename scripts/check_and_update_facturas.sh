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

echo "Verificando y actualizando tabla facturas..."

# SQL para verificar y actualizar la tabla
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME << EOF
BEGIN;

-- Verificar si las columnas existen y añadirlas si no
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'facturas' AND column_name = 'fecha_aceptacion') THEN
        ALTER TABLE facturas ADD COLUMN fecha_aceptacion TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'facturas' AND column_name = 'fecha_pago') THEN
        ALTER TABLE facturas ADD COLUMN fecha_pago TIMESTAMP;
    END IF;

    -- Actualizar fechas existentes si es necesario
    UPDATE facturas 
    SET fecha_aceptacion = fecha_emision
    WHERE estado IN ('aceptada', 'pagada')
    AND fecha_aceptacion IS NULL;

    UPDATE facturas 
    SET fecha_pago = fecha_emision
    WHERE estado = 'pagada'
    AND fecha_pago IS NULL;
END
\$\$;

COMMIT;

-- Verificar la estructura final
\d facturas;
EOF

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
    echo "✅ Tabla facturas verificada y actualizada exitosamente"
else
    echo "❌ Error al verificar/actualizar la tabla facturas"
    exit 1
fi 