#!/bin/bash

# Cambiar al directorio del backend
cd "$(dirname "$0")/../backend"

# Crear archivo temporal de JavaScript
cat > temp_setup_db.js << 'EOL'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function setupDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS codigos (
                id SERIAL PRIMARY KEY,
                negocio_id INTEGER REFERENCES negocios(id),
                codigo VARCHAR(50) UNIQUE NOT NULL,
                porcentaje INTEGER NOT NULL,
                fecha_inicio DATE NOT NULL,
                fecha_fin DATE NOT NULL,
                codigo_qr TEXT,
                estado BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('Tabla códigos creada/verificada exitosamente');

        // Crear tabla de formularios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS formularios (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                telefono VARCHAR(20),
                mensaje TEXT NOT NULL,
                atendido BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Tabla formularios creada/verificada exitosamente');

        // Crear tabla de facturas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS facturas (
                id SERIAL PRIMARY KEY,
                negocio_id INTEGER REFERENCES negocios(id),
                monto DECIMAL(10,2) NOT NULL,
                concepto TEXT NOT NULL,
                fecha_vencimiento DATE NOT NULL,
                pagada BOOLEAN DEFAULT false,
                fecha_pago TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Tabla facturas creada/verificada exitosamente');

        // Crear tabla de canjes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS canjes (
                id SERIAL PRIMARY KEY,
                codigo_id INTEGER REFERENCES codigos(id),
                negocio_id INTEGER REFERENCES negocios(id),
                metodo_canje VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Tabla canjes creada/verificada exitosamente');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

setupDatabase();
EOL

# Ejecutar el script
node temp_setup_db.js

# Eliminar archivo temporal
rm temp_setup_db.js 