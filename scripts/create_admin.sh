#!/bin/bash

# Cambiar al directorio del backend
cd "$(dirname "$0")/../backend"

# Crear archivo temporal de JavaScript
cat > temp_create_admin.js << 'EOL'
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

async function createAdmin() {
    try {
        // Generar hash de la contraseña
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario admin
        const result = await pool.query(
            `INSERT INTO usuarios (
                nombre,
                usuario,
                email,
                password,
                role
            ) VALUES ($1, $2, $3, $4, $5) 
            ON CONFLICT (email) DO NOTHING
            RETURNING id`,
            ['Administrador', 'admin', 'admin@admin.com', hashedPassword, 'admin']
        );

        if (result.rows.length > 0) {
            console.log('Usuario admin creado exitosamente');
            console.log('Usuario: admin');
            console.log('Email: admin@admin.com');
            console.log('Contraseña: admin123');
        } else {
            console.log('El usuario admin ya existe');
        }
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    } finally {
        await pool.end();
    }
}

createAdmin();
EOL

# Ejecutar el script
node temp_create_admin.js

# Eliminar archivo temporal
rm temp_create_admin.js 