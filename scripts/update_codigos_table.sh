#!/bin/bash

cd "$(dirname "$0")/../backend"

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
        // Iniciar transacción
        await pool.query('BEGIN');

        // Actualizar tipos de columnas
        await pool.query(`
            ALTER TABLE codigos 
            ALTER COLUMN fecha_inicio TYPE TIMESTAMP USING fecha_inicio::timestamp,
            ALTER COLUMN fecha_fin TYPE TIMESTAMP USING fecha_fin::timestamp,
            ALTER COLUMN fecha_inicio SET DEFAULT CURRENT_TIMESTAMP
        `);

        // Verificar si la columna email existe
        const checkEmailColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'codigos' AND column_name = 'email'
        `);

        if (checkEmailColumn.rows.length === 0) {
            await pool.query(`
                ALTER TABLE codigos 
                ADD COLUMN email VARCHAR(100)
            `);
        }

        await pool.query('COMMIT');
        console.log('Tabla codigos actualizada exitosamente');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al actualizar la tabla:', error);
    } finally {
        await pool.end();
    }
}

updateTable();
EOL

node temp_update_table.js
rm temp_update_table.js 