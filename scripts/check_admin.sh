#!/bin/bash

# Cambiar al directorio del backend
cd "$(dirname "$0")/../backend"

# Crear archivo temporal de JavaScript
cat > temp_check_admin.js << 'EOL'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkDatabase() {
    try {
        // Verificar si la tabla existe
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'usuarios'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('La tabla usuarios no existe. Creándola...');
            await pool.query(`
                CREATE TABLE usuarios (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(100) NOT NULL,
                    usuario VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'user',
                    estado BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('Tabla usuarios creada.');
        }

        // Verificar usuario admin
        const adminCheck = await pool.query(
            'SELECT id, nombre, usuario, email, password, role, estado FROM usuarios WHERE email = $1',
            ['admin@admin.com']
        );

        if (adminCheck.rows.length > 0) {
            console.log('Usuario admin encontrado:');
            console.log('ID:', adminCheck.rows[0].id);
            console.log('Usuario:', adminCheck.rows[0].usuario);
            console.log('Email:', adminCheck.rows[0].email);
            console.log('Role:', adminCheck.rows[0].role);
            console.log('Estado:', adminCheck.rows[0].estado);
            console.log('Password Hash:', adminCheck.rows[0].password.substring(0, 20) + '...');
        } else {
            console.log('No se encontró el usuario admin');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkDatabase();
EOL

# Ejecutar el script
node temp_check_admin.js

# Eliminar archivo temporal
rm temp_check_admin.js 