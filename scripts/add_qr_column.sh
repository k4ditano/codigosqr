#!/bin/bash

# Cambiar al directorio del backend
cd "$(dirname "$0")/../backend"

# Crear archivo temporal de JavaScript
cat > temp_add_column.js << 'EOL'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addQRColumn() {
    try {
        // Verificar si la columna ya existe
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'codigos' AND column_name = 'codigo_qr'
        `);

        if (checkColumn.rows.length === 0) {
            // La columna no existe, la agregamos
            await pool.query(`
                ALTER TABLE codigos 
                ADD COLUMN codigo_qr TEXT
            `);
            console.log('Columna codigo_qr agregada exitosamente');
        } else {
            console.log('La columna codigo_qr ya existe');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

addQRColumn();
EOL

# Ejecutar el script
node temp_add_column.js

# Eliminar archivo temporal
rm temp_add_column.js 