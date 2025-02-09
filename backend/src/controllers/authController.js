const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

class AuthController {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    async login(req, res) {
        const client = await this.pool.connect();
        try {
            const { usuario, password } = req.body;

            // Primero buscar en la tabla negocios
            const result = await client.query(
                `SELECT id, nombre, email, usuario, password, role 
                FROM negocios 
                WHERE usuario = $1 AND estado = true`,
                [usuario]
            );

            let user = result.rows[0];

            // Si no se encuentra en negocios, buscar en usuarios
            if (!user) {
                const adminResult = await client.query(
                    `SELECT id, nombre, usuario, password, role 
                    FROM usuarios 
                    WHERE usuario = $1 AND estado = true`,
                    [usuario]
                );
                user = adminResult.rows[0];
            }

            if (!user) {
                return res.status(401).json({ error: 'Usuario no encontrado' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }

            const token = jwt.sign(
                { 
                    id: user.id, 
                    usuario: user.usuario,
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token, user: { 
                id: user.id,
                nombre: user.nombre,
                usuario: user.usuario,
                role: user.role
            }});

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ 
                error: 'Error al iniciar sesión',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const result = await this.pool.query(
                'SELECT id, usuario, nombre, email, role FROM usuarios WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({ error: 'Error al obtener el perfil' });
        }
    }

    async register(req, res) {
        try {
            const { nombre, usuario, password, email, role = 'business' } = req.body;

            // Verificar si el usuario ya existe
            const userExists = await this.pool.query(
                'SELECT id FROM usuarios WHERE usuario = $1 OR email = $2',
                [usuario, email]
            );

            if (userExists.rows.length > 0) {
                return res.status(400).json({ 
                    error: 'El usuario o email ya existe' 
                });
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear el usuario
            const result = await this.pool.query(
                `INSERT INTO usuarios (nombre, usuario, password, email, role)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, usuario, nombre, email, role`,
                [nombre, usuario, hashedPassword, email, role]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ 
                error: 'Error al registrar el usuario',
                details: error.message 
            });
        }
    }
}

module.exports = new AuthController(); 