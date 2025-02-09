const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function createAdmin() {
    try {
        // Generar hash de la contraseña
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        console.log('Creando usuario admin...');

        // Verificar si existe la tabla negocios
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'negocios'
            );
        `);

        if (!tableExists.rows[0].exists) {
            console.error('La tabla negocios no existe. Por favor, ejecuta primero el schema.sql');
            process.exit(1);
        }

        // Eliminar usuario admin existente si existe
        await pool.query('DELETE FROM negocios WHERE usuario = $1', ['admin']);
        
        // Crear nuevo usuario admin
        const query = `
            INSERT INTO negocios (
                nombre, 
                email, 
                telefono, 
                usuario, 
                password,
                estado,
                role
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, nombre, email, usuario, role
        `;
        
        const values = [
            'Administrador',
            'admin@admin.com',
            '123456789',
            'admin',
            hash,
            true,
            'admin'
        ];
        
        const result = await pool.query(query, values);
        console.log('Usuario admin creado exitosamente:', result.rows[0]);
        console.log('Credenciales:');
        console.log('Usuario: admin');
        console.log('Contraseña: admin123');

    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    } finally {
        await pool.end();
        process.exit();
    }
}

// Ejecutar la función
createAdmin(); 