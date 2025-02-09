const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const qrService = require('../services/qrService');

class NegociosController {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    async crear(req, res) {
        const client = await this.pool.connect();
        try {
            const { nombre, email } = req.body;

            // Validar datos requeridos
            if (!nombre || !email) {
                return res.status(400).json({ 
                    error: 'Nombre y email son requeridos' 
                });
            }

            // Verificar si el email ya existe
            const emailExists = await client.query(
                'SELECT id FROM negocios WHERE email = $1',
                [email]
            );

            if (emailExists.rows.length > 0) {
                return res.status(400).json({ 
                    error: 'El email ya está registrado' 
                });
            }

            // Generar usuario a partir del email y contraseña aleatoria
            const usuario = email.split('@')[0];
            const password = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(password, 10);

            await client.query('BEGIN');

            // Insertar el negocio
            const result = await client.query(
                `INSERT INTO negocios (
                    nombre,
                    email,
                    usuario,
                    password,
                    estado,
                    role
                ) VALUES ($1, $2, $3, $4, true, 'business')
                RETURNING id, nombre, email, usuario, estado`,
                [nombre, email, usuario, hashedPassword]
            );

            // Enviar email con las credenciales
            try {
                await emailService.sendBusinessCredentials(
                    email,
                    usuario,
                    password
                );
                console.log('Email de credenciales enviado a:', email, 'con usuario:', usuario, 'y password:', password);
            } catch (emailError) {
                console.error('Error al enviar email:', emailError);
                // No detenemos la creación si falla el email
            }

            await client.query('COMMIT');

            res.status(201).json({
                mensaje: 'Negocio creado exitosamente',
                negocio: result.rows[0],
                credenciales: {
                    usuario: usuario,
                    email: email,
                    password: password
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error detallado al crear negocio:', error);
            res.status(400).json({ 
                error: 'Error al crear el negocio',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async listar(req, res) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `SELECT 
                    id, 
                    nombre, 
                    email,
                    estado,
                    created_at
                FROM negocios 
                ORDER BY created_at DESC`
            );
            
            res.json(result.rows);
        } catch (error) {
            console.error('Error detallado al listar negocios:', error);
            res.status(500).json({ 
                error: 'Error al listar los negocios',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async actualizar(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            const { nombre, email, telefono, estado } = req.body;

            const result = await client.query(
                `UPDATE negocios 
                SET nombre = $1, email = $2, telefono = $3, estado = $4
                WHERE id = $5
                RETURNING *`,
                [nombre, email, telefono, estado, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al actualizar el negocio:', error);
            res.status(500).json({ 
                error: 'Error al actualizar el negocio',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtener(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            console.log('Obteniendo negocio con ID:', id);

            if (id === 'count') {
                const result = await client.query('SELECT COUNT(*) FROM negocios WHERE role != $1', ['admin']);
                return res.json({ count: parseInt(result.rows[0].count) });
            }

            const result = await client.query(
                'SELECT * FROM negocios WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener negocio:', error);
            res.status(500).json({ 
                error: 'Error al obtener el negocio',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async getCount(req, res) {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT COUNT(*) FROM negocios WHERE role != $1', ['admin']);
            res.json({ count: parseInt(result.rows[0].count) });
        } catch (error) {
            console.error('Error al obtener conteo de negocios:', error);
            res.status(500).json({ 
                error: 'Error al obtener el conteo de negocios',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtenerQR(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            console.log('Obteniendo QR para negocio:', id);

            const result = await client.query(
                'SELECT codigo_qr FROM negocios WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            // Si el QR no existe, generarlo
            if (!result.rows[0].codigo_qr) {
                console.log('QR no encontrado, generando nuevo QR');
                const qrCode = await qrService.generateBusinessQR(
                    id,
                    process.env.BASE_URL || 'http://localhost:3000'
                );
                
                console.log('QR generado, actualizando en base de datos');
                await client.query(
                    'UPDATE negocios SET codigo_qr = $1 WHERE id = $2',
                    [qrCode, id]
                );
                
                return res.json({ codigo_qr: qrCode });
            }

            console.log('QR encontrado en base de datos');
            res.json({ codigo_qr: result.rows[0].codigo_qr });
        } catch (error) {
            console.error('Error detallado al obtener QR:', error);
            res.status(500).json({ 
                error: 'Error al obtener el código QR',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async eliminar(req, res) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;

            // Verificar si el negocio existe
            const negocioExists = await client.query(
                'SELECT id FROM negocios WHERE id = $1',
                [id]
            );

            if (negocioExists.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            // 1. Primero eliminar los formularios
            await client.query(
                'DELETE FROM formularios WHERE negocio_id = $1',
                [id]
            );

            // 2. Eliminar las facturas
            await client.query(
                'DELETE FROM facturas WHERE negocio_id = $1',
                [id]
            );

            // 3. Eliminar los canjes
            await client.query(
                'DELETE FROM canjes WHERE negocio_id = $1',
                [id]
            );

            // 4. Eliminar los códigos
            await client.query(
                'DELETE FROM codigos WHERE negocio_id = $1',
                [id]
            );

            // 5. Finalmente eliminar el negocio
            await client.query(
                'DELETE FROM negocios WHERE id = $1',
                [id]
            );

            await client.query('COMMIT');

            res.json({ 
                mensaje: 'Negocio y todos sus datos relacionados eliminados exitosamente',
                detalles: 'Se han eliminado los formularios, facturas, canjes y códigos asociados'
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error detallado al eliminar negocio:', error);
            res.status(500).json({ 
                error: 'Error al eliminar el negocio y sus datos relacionados',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtenerConteo(req, res) {
        try {
            const result = await this.pool.query('SELECT COUNT(*) as total FROM negocios');
            res.json({ count: parseInt(result.rows[0].total) });
        } catch (error) {
            console.error('Error al obtener conteo de negocios:', error);
            res.status(500).json({ 
                msg: 'Error al obtener conteo de negocios',
                error: error.message 
            });
        }
    }

    async obtenerPublico(req, res) {
        const client = await this.pool.connect();
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID de negocio inválido' });
            }

            const result = await client.query(
                'SELECT id, nombre FROM negocios WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener negocio público:', error);
            res.status(500).json({ 
                error: 'Error al obtener la información del negocio',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }
}

module.exports = NegociosController; 