const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const qrService = require('../services/qrService');
const QRCode = require('qrcode');

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
            const { nombre, email, email_asociado, telefono } = req.body;

            console.log('Datos recibidos en crear:', {
                nombre,
                email,
                email_asociado,
                telefono
            });

            if (!nombre || !email) {
                return res.status(400).json({
                    error: 'Nombre y email son requeridos'
                });
            }

            const emailExists = await client.query(
                'SELECT id FROM negocios WHERE email = $1',
                [email]
            );

            if (emailExists.rows.length > 0) {
                return res.status(400).json({
                    error: 'El email ya está registrado'
                });
            }

            const usuario = email.split('@')[0];
            const password = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(password, 10);

            await client.query('BEGIN');

            // Verificar el valor de email_asociado antes de la inserción
            console.log('Valor de email_asociado antes de insertar:', email_asociado);
            console.log('Tipo de email_asociado:', typeof email_asociado);

            const insertQuery = `
                INSERT INTO negocios (
                    nombre,
                    email,
                    email_asociado,
                    telefono,
                    usuario,
                    password,
                    estado,
                    role
                ) VALUES ($1, $2, $3, $4, $5, $6, true, 'business')
                RETURNING *`;

            const insertValues = [
                nombre,
                email,
                email_asociado || null,
                telefono || null,
                usuario,
                hashedPassword
            ];

            console.log('Valores a insertar:', insertValues);

            const result = await client.query(insertQuery, insertValues);

            // Generar QR después de crear el negocio
            const baseUrl = process.env.BASE_URL || 'http://145.223.100.119';
            const qrUrl = `${baseUrl}/formulario/${result.rows[0].id}`;
            const qrCode = await QRCode.toDataURL(qrUrl);

            // Guardar el QR en la base de datos
            await client.query(
                'UPDATE negocios SET codigo_qr = $1 WHERE id = $2',
                [qrCode, result.rows[0].id]
            );

            console.log('Resultado de la inserción:', result.rows[0]);

            try {
                await emailService.sendBusinessCredentials(
                    email,
                    usuario,
                    password
                );
            } catch (emailError) {
                console.error('Error al enviar email:', emailError);
            }

            await client.query('COMMIT');

            // Verificar los datos que se van a devolver
            console.log('Datos a devolver en la respuesta:', {
                mensaje: 'Negocio creado exitosamente',
                negocio: result.rows[0]
            });

            res.status(201).json({
                mensaje: 'Negocio creado exitosamente',
                negocio: result.rows[0],
                credenciales: {
                    usuario: usuario,
                    email: email
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error completo al crear negocio:', error);
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
            console.log('Ejecutando consulta listar negocios');
            const result = await client.query(
                `SELECT 
                    n.id, 
                    n.nombre, 
                    n.email,
                    n.email_asociado,
                    n.telefono,
                    n.estado,
                    n.created_at,
                    n.role
                FROM negocios n
                WHERE n.role != 'admin'
                ORDER BY n.created_at DESC`
            );

            // Log para depuración
            console.log('Datos obtenidos de la base de datos:', result.rows);

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
            const { nombre, email, email_asociado, telefono, estado } = req.body;

            const result = await client.query(
                `UPDATE negocios 
                SET nombre = $1, email = $2, email_asociado = $3, telefono = $4, estado = $5
                WHERE id = $6
                RETURNING *`,
                [nombre, email, email_asociado, telefono, estado, id]
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
                const baseUrl = process.env.BASE_URL || 'http://145.223.100.119';
                const qrUrl = `${baseUrl}/formulario/${id}`;
                const qrCode = await QRCode.toDataURL(qrUrl);

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
