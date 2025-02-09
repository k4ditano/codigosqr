const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    async login(req, res) {
        try {
            const { usuario, password } = req.body;
            
            // Buscar usuario en la base de datos
            const result = await pool.query(
                'SELECT id, nombre, email, usuario, password, role FROM negocios WHERE usuario = $1',
                [usuario]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            const user = result.rows[0];

            // Verificar contraseña
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Generar token incluyendo el rol y el ID
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email,
                    role: user.role || 'business'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    usuario: user.usuario,
                    role: user.role || 'business'
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }

    async adminLogin(req, res) {
        try {
            const { usuario, password } = req.body;
            
            // En un caso real, esto estaría en la base de datos
            if (usuario === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
                const token = jwt.sign(
                    { 
                        role: 'admin',
                        usuario 
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                
                res.json({ token });
            } else {
                res.status(401).json({ error: 'Credenciales inválidas' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    }
}

module.exports = new AuthController(); 