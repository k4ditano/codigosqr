const { Pool } = require('pg');
const qrcode = require('qrcode');
const emailService = require('../services/emailService');
const pool = new Pool();

class CodigosController {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    async generarCodigoUnico() {
        const client = await this.pool.connect();
        try {
            let codigoUnico;
            let existe;
            
            do {
                // Generar código aleatorio de 6 caracteres
                codigoUnico = Math.random().toString(36).substring(2, 8).toUpperCase();
                
                // Verificar si ya existe
                const result = await client.query(
                    'SELECT id FROM codigos WHERE codigo = $1',
                    [codigoUnico]
                );
                
                existe = result.rows.length > 0;
            } while (existe);

            return codigoUnico;
        } finally {
            client.release();
        }
    }

    async crear(req, res) {
        const client = await this.pool.connect();
        try {
            const { email, negocio_id, fecha_expiracion, porcentaje = 10 } = req.body;

            await client.query('BEGIN');

            // Generar código único
            const codigo = await this.generarCodigoUnico();
            
            // Calcular fecha de expiración (30 días desde la creación)
            const fechaExpiracion = new Date();
            fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);
            
            // Insertar el código
            const result = await client.query(
                `INSERT INTO codigos (
                    codigo, 
                    email, 
                    negocio_id,
                    porcentaje,
                    fecha_fin,
                    estado,
                    created_at
                ) VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
                RETURNING *`,
                [
                    codigo,
                    email,
                    negocio_id ? parseInt(negocio_id) : null,
                    porcentaje,
                    fecha_expiracion ? new Date(fecha_expiracion) : fechaExpiracion // 30 días por defecto
                ]
            );

            // Enviar email con el código
            const emailEnviado = await emailService.enviarCodigoDescuento(email, codigo);
            
            if (!emailEnviado) {
                console.error('Error al enviar el email');
                // Continuamos aunque el email falle
            }

            await client.query('COMMIT');

            res.status(201).json({
                ...result.rows[0],
                emailEnviado
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al crear código:', error);
            res.status(500).json({ 
                error: 'Error al crear el código',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async validar(req, res) {
        const client = await this.pool.connect();
        try {
            const { codigo } = req.body;
            const negocio_id = req.user.id;

            await client.query('BEGIN');

            // Verificar si el código existe, está activo y es válido para el negocio
            const result = await client.query(
                `SELECT c.*, n.nombre as negocio_nombre 
                FROM codigos c
                LEFT JOIN negocios n ON c.negocio_id = n.id
                WHERE c.codigo = $1 
                AND c.estado = true 
                AND (c.negocio_id IS NULL OR c.negocio_id = $2)`,
                [codigo, negocio_id]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Código no válido o no autorizado para este negocio' });
            }

            const codigoInfo = result.rows[0];

            // Verificar la fecha de expiración
            if (codigoInfo.fecha_fin && new Date(codigoInfo.fecha_fin) < new Date()) {
                await client.query('ROLLBACK');
                return res.status(400).json({ 
                    error: 'El código ha expirado',
                    fecha_expiracion: codigoInfo.fecha_fin
                });
            }

            // Registrar el canje
            const canjeResult = await client.query(
                `INSERT INTO canjes (codigo_id, negocio_id, metodo_canje)
                VALUES ($1, $2, 'manual')
                RETURNING id`,
                [codigoInfo.id, negocio_id]
            );

            // Crear la factura asociada al canje
            await client.query(
                `INSERT INTO facturas (
                    negocio_id, 
                    canje_id,
                    monto_descuento,
                    monto_ingreso,
                    estado,
                    fecha_emision
                ) VALUES ($1, $2, $3, $4, 'pendiente', CURRENT_TIMESTAMP)`,
                [negocio_id, canjeResult.rows[0].id, 25.00, 25.00]
            );

            // Desactivar el código
            await client.query(
                'UPDATE codigos SET estado = false WHERE id = $1',
                [codigoInfo.id]
            );

            await client.query('COMMIT');

            res.json({
                mensaje: 'Código validado exitosamente',
                descuento: codigoInfo.porcentaje,
                negocio: codigoInfo.negocio_nombre
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al validar código:', error);
            res.status(500).json({ 
                error: 'Error al validar el código',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async listar(req, res) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    c.*,
                    n.nombre as negocio_nombre,
                    to_char(c.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as fecha_creacion,
                    to_char(c.fecha_fin AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as fecha_fin
                FROM codigos c
                LEFT JOIN negocios n ON c.negocio_id = n.id
                ORDER BY c.created_at DESC
            `);

            res.json(result.rows);
        } catch (error) {
            console.error('Error al listar códigos:', error);
            res.status(500).json({ 
                error: 'Error al listar los códigos',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtenerCanjes(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            const result = await client.query(
                `SELECT c.*, cd.codigo, n.nombre as negocio_nombre
                FROM canjes c
                JOIN codigos cd ON c.codigo_id = cd.id
                JOIN negocios n ON c.negocio_id = n.id
                WHERE cd.id = $1
                ORDER BY c.created_at DESC`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.json({
                    codigo: null,
                    canjes: []
                });
            }

            const codigoInfo = await client.query(
                'SELECT * FROM codigos WHERE id = $1',
                [id]
            );

            res.json({
                codigo: codigoInfo.rows[0],
                canjes: result.rows
            });
        } catch (error) {
            console.error('Error al obtener canjes:', error);
            res.status(500).json({ 
                error: 'Error al obtener los canjes del código',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async getCount(req, res) {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT COUNT(*) as total FROM codigos');
            res.json({ count: parseInt(result.rows[0].total) });
        } catch (error) {
            console.error('Error al obtener conteo de códigos:', error);
            res.status(500).json({ 
                msg: 'Error al obtener conteo de códigos',
                error: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtenerCanjesPorNegocio(req, res) {
        const client = await this.pool.connect();
        try {
            const { negocioId } = req.params;
            const result = await client.query(
                `SELECT c.*, cd.codigo, cd.email 
                FROM canjes c
                JOIN codigos cd ON c.codigo_id = cd.id
                WHERE c.negocio_id = $1
                ORDER BY c.created_at DESC`,
                [negocioId]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener canjes por negocio:', error);
            res.status(500).json({ 
                error: 'Error al obtener los canjes del negocio',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async validarPublico(req, res) {
        const client = await this.pool.connect();
        try {
            const { codigo } = req.body;
            const negocio_id = req.user.id;

            // Verificar si el código existe, está activo y pertenece al negocio correcto
            const result = await client.query(
                `SELECT cd.*, n.nombre as negocio_nombre 
                FROM codigos cd
                LEFT JOIN negocios n ON cd.negocio_id = n.id
                WHERE cd.codigo = $1 
                AND cd.estado = true 
                AND cd.fecha_fin > NOW()
                AND (cd.negocio_id IS NULL OR cd.negocio_id = $2)`,
                [codigo, negocio_id]
            );

            if (result.rows.length === 0) {
                return res.status(403).json({ 
                    error: 'Código inválido, expirado o no autorizado para este negocio' 
                });
            }

            const codigoInfo = result.rows[0];

            await client.query('BEGIN');
            try {
                // Registrar el canje
                await client.query(
                    `INSERT INTO canjes (
                        codigo_id, 
                        negocio_id, 
                        metodo_canje
                    ) VALUES ($1, $2, $3)`,
                    [codigoInfo.id, negocio_id, 'qr']
                );

                // Desactivar el código
                await client.query(
                    'UPDATE codigos SET estado = false WHERE id = $1',
                    [codigoInfo.id]
                );

                await client.query('COMMIT');

                res.json({ 
                    mensaje: `¡Código canjeado exitosamente!`,
                    codigo: codigoInfo
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Error al validar código público:', error);
            res.status(500).json({ 
                error: 'Error al validar el código',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtenerCanjesNegocio(req, res) {
        const client = await this.pool.connect();
        try {
            const { negocioId } = req.params;
            const result = await client.query(
                `SELECT 
                    c.id,
                    cd.codigo,
                    to_char(c.created_at, 'DD/MM/YYYY HH24:MI') as fecha_canje
                FROM canjes c
                JOIN codigos cd ON c.codigo_id = cd.id
                WHERE c.negocio_id = $1
                ORDER BY c.created_at DESC`,
                [negocioId]
            );
            
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener canjes:', error);
            res.status(500).json({ 
                error: 'Error al obtener los canjes',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async contarCodigos(req, res) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT COUNT(*) FROM codigos WHERE estado = true');
            res.json({ count: parseInt(result.rows[0].count) });
        } catch (error) {
            console.error('Error al contar códigos:', error);
            res.status(500).json({ 
                error: 'Error al contar códigos',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }
}

module.exports = new CodigosController(); 