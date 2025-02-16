const { Pool } = require('pg');
const emailService = require('../services/emailService');

class FormulariosController {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,  // Añadiendo el nombre de la base de datos
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    async crear(req, res) {
        const client = await this.pool.connect();
        try {
            const { nombre, email, telefono, mensaje, negocio_id } = req.body;
            console.log('Recibido formulario para negocio:', negocio_id);

            // Primero obtener los datos del negocio
            const negocioResult = await client.query(
                'SELECT nombre, email_asociado FROM negocios WHERE id = $1',
                [negocio_id]
            );

            if (negocioResult.rows.length === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            const negocio = negocioResult.rows[0];

            console.log('Datos del negocio encontrado:', {
                nombre: negocio.nombre,
                tieneEmailAsociado: !!negocio.email_asociado
            });

            // Insertar el formulario
            const result = await client.query(
                `INSERT INTO formularios (
                    nombre, 
                    email, 
                    telefono, 
                    mensaje, 
                    negocio_id,
                    created_at
                )
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                RETURNING *`,
                [nombre, email, telefono, mensaje, negocio_id]
            );

            // Enviar email de notificación solo si existe email_asociado
            if (negocio.email_asociado) {
                console.log('Intentando enviar notificación al email_asociado:', negocio.email_asociado);
                try {
                    const emailEnviado = await emailService.notificarNuevoFormulario({
                        emailNegocio: negocio.email_asociado,
                        nombreNegocio: negocio.nombre,
                        datosFormulario: { nombre, email, telefono, mensaje }
                    });

                    console.log('Resultado del envío de email:', emailEnviado);

                    if (!emailEnviado) {
                        console.error('El email no se pudo enviar pero el formulario se guardó');
                    }
                } catch (emailError) {
                    console.error('Error detallado al enviar notificación por email:', {
                        error: emailError.message,
                        negocio: negocio.nombre,
                        emailDestino: negocio.email_asociado
                    });
                }
            } else {
                console.log('El negocio no tiene email_asociado configurado para notificaciones');
            }

            res.status(201).json({
                ...result.rows[0],
                mensaje: 'Formulario creado exitosamente',
                notificacionEnviada: !!negocio.email_asociado
            });

        } catch (error) {
            console.error('Error al crear formulario:', error);
            res.status(500).json({
                error: 'Error al crear formulario',
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
                    f.*,
                    n.nombre as negocio_nombre,
                    to_char(f.created_at, 'DD/MM/YYYY HH24:MI') as fecha_formateada
                FROM formularios f
                LEFT JOIN negocios n ON f.negocio_id = n.id
                ORDER BY f.created_at DESC`
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error al listar formularios:', error);
            res.status(500).json({
                error: 'Error al listar formularios',
                details: error.message
            });
        } finally {
            client.release();
        }
    }

    async obtener(req, res) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM formularios WHERE id = $1',
                [req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Formulario no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener formulario:', error);
            res.status(500).json({
                error: 'Error al obtener formulario',
                details: error.message
            });
        } finally {
            client.release();
        }
    }

    async marcarAtendido(req, res) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                'UPDATE formularios SET atendido = true WHERE id = $1 RETURNING *',
                [req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Formulario no encontrado' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al marcar formulario como atendido:', error);
            res.status(500).json({
                error: 'Error al actualizar formulario',
                details: error.message
            });
        } finally {
            client.release();
        }
    }

    async obtenerConteo(req, res) {
        try {
            const result = await this.pool.query('SELECT COUNT(*) as total FROM formularios');
            res.json({ count: parseInt(result.rows[0].total) });
        } catch (error) {
            console.error('Error al obtener conteo de formularios:', error);
            res.status(500).json({
                msg: 'Error al obtener conteo de formularios',
                error: error.message
            });
        }
    }
}

module.exports = new FormulariosController();
