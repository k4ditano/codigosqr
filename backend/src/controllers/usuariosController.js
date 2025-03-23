const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

class UsuariosController {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    async listar(req, res) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    n.id,
                    n.nombre,
                    n.email,
                    n.email_asociado,
                    n.telefono,
                    n.estado,
                    n.role,
                    to_char(n.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as fecha_registro
                FROM negocios n
                ORDER BY n.created_at DESC
            `);

            res.json(result.rows);
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            res.status(500).json({ error: 'Error al obtener la lista de usuarios' });
        } finally {
            client.release();
        }
    }

    async actualizar(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            const { nombre, email, email_asociado, telefono, estado, role } = req.body;

            const result = await client.query(`
                UPDATE negocios
                SET 
                    nombre = COALESCE($1, nombre),
                    email = COALESCE($2, email),
                    email_asociado = $3,
                    telefono = $4,
                    estado = COALESCE($5, estado),
                    role = COALESCE($6, role),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING *
            `, [nombre, email, email_asociado, telefono, estado, role, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ error: 'Error al actualizar el usuario' });
        } finally {
            client.release();
        }
    }

    async cambiarEstado(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const result = await client.query(`
                UPDATE negocios
                SET estado = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `, [estado, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al cambiar estado del usuario:', error);
            res.status(500).json({ error: 'Error al cambiar el estado del usuario' });
        } finally {
            client.release();
        }
    }

    async resetearPassword(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            const newPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const result = await client.query(`
                UPDATE negocios
                SET 
                    password = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING email
            `, [hashedPassword, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Aquí deberías enviar el email con la nueva contraseña
            // usando el emailService que ya tienes implementado

            res.json({ 
                mensaje: 'Contraseña reseteada exitosamente',
                email: result.rows[0].email
            });
        } catch (error) {
            console.error('Error al resetear contraseña:', error);
            res.status(500).json({ error: 'Error al resetear la contraseña' });
        } finally {
            client.release();
        }
    }
}

module.exports = new UsuariosController();
