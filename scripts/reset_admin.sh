#!/bin/bash

# Cambiar al directorio del backend
cd "$(dirname "$0")/../backend"

# Crear archivo temporal de JavaScript
cat > temp_reset_admin.js << 'EOL'
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function resetAdmin() {
    try {
        // Eliminar usuario admin existente
        await pool.query('DELETE FROM usuarios WHERE email = $1', ['admin@admin.com']);
        
        // Generar nuevo hash de la contraseña
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario admin
        const result = await pool.query(
            `INSERT INTO usuarios (
                nombre,
                usuario,
                email,
                password,
                role,
                estado
            ) VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id`,
            ['Administrador', 'admin', 'admin@admin.com', hashedPassword, 'admin', true]
        );

        console.log('Usuario admin recreado exitosamente');
        console.log('Credenciales:');
        console.log('Usuario: admin');
        console.log('Email: admin@admin.com');
        console.log('Contraseña: admin123');
        
        // Verificar el usuario creado
        const adminCheck = await pool.query(
            'SELECT id, nombre, usuario, email, role, estado FROM usuarios WHERE email = $1',
            ['admin@admin.com']
        );
        
        console.log('\nDetalles del usuario creado:');
        console.log(adminCheck.rows[0]);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

resetAdmin();
EOL

# Ejecutar el script
node temp_reset_admin.js

# Eliminar archivo temporal
rm temp_reset_admin.js 