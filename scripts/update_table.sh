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