#!/bin/bash

# Cambiar al directorio del backend
cd "$(dirname "$0")/../backend"

# Crear archivo temporal de JavaScript
cat > temp_verify_admin.js << 'EOL'
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

async function verifyAdmin() {
    try {
        // Verificar usuario admin
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE usuario = $1',
            ['admin']
        );

        if (result.rows.length === 0) {
            console.log('Usuario admin no encontrado');
            return;
        }

        const user = result.rows[0];
        console.log('Usuario encontrado:');
        console.log('ID:', user.id);
        console.log('Usuario:', user.usuario);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('Estado:', user.estado);

        // Verificar si la contraseña 'admin123' coincide
        const validPassword = await bcrypt.compare('admin123', user.password);
        console.log('\nVerificación de contraseña:');
        console.log('La contraseña "admin123" es:', validPassword ? 'válida' : 'inválida');
        
        // Mostrar los primeros caracteres del hash para verificación
        console.log('Hash de contraseña:', user.password.substring(0, 20) + '...');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

verifyAdmin();
EOL

# Ejecutar el script
node temp_verify_admin.js

# Eliminar archivo temporal
rm temp_verify_admin.js 