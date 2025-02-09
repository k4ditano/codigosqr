#!/bin/bash

# Cambiar al directorio del backend
cd "$(dirname "$0")/../backend"

# Crear archivo temporal de JavaScript
cat > temp_update_table.js << 'EOL'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function updateTable() {
    try {
        // Agregar columna usuario si no existe
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'usuarios' AND column_name = 'usuario'
                ) THEN 
                    ALTER TABLE usuarios ADD COLUMN usuario VARCHAR(50) UNIQUE;
                    UPDATE usuarios SET usuario = 'admin' WHERE email = 'admin@admin.com';
                END IF;
            END $$;
        `);
        
        console.log('Tabla actualizada correctamente');
        
        // Verificar usuario admin
        const adminCheck = await pool.query(
            'SELECT usuario, email, role FROM usuarios WHERE email = $1',
            ['admin@admin.com']
        );

        if (adminCheck.rows.length > 0) {
            console.log('Usuario admin actualizado:');
            console.log(adminCheck.rows[0]);
        }

        // Actualizar la columna fecha_fin si existe o crearla si no existe
        await pool.query(`
            DO \$\$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'codigos' AND column_name = 'fecha_fin'
                ) THEN
                    ALTER TABLE codigos 
                    ALTER COLUMN fecha_fin TYPE TIMESTAMP WITH TIME ZONE;
                ELSE
                    ALTER TABLE codigos 
                    ADD COLUMN fecha_fin TIMESTAMP WITH TIME ZONE;
                END IF;
            END
            \$\$;
        `);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

updateTable();
EOL

# Ejecutar el script
node temp_update_table.js

# Eliminar archivo temporal
rm temp_update_table.js 

\c sistema_descuentos;

-- Crear tablas base
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS negocios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS codigos (
    id SERIAL PRIMARY KEY,
    negocio_id INTEGER REFERENCES negocios(id),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    porcentaje INTEGER NOT NULL,
    codigo_qr TEXT,
    fecha_fin TIMESTAMP,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS canjes (
    id SERIAL PRIMARY KEY,
    codigo_id INTEGER REFERENCES codigos(id),
    negocio_id INTEGER REFERENCES negocios(id),
    metodo_canje VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS formularios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    atendido BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_facturas_negocio ON facturas(negocio_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_emision ON facturas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_codigos_negocio ON codigos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_canjes_negocio ON canjes(negocio_id);
CREATE INDEX IF NOT EXISTS idx_canjes_codigo ON canjes(codigo_id); 