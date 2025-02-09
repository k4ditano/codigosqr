const pool = require('../config/db');
const qrService = require('../services/qrService');
const emailService = require('../services/emailService');

class CodigosController {
    async crear(req, res) {
        try {
            const { cliente_email, fecha_expiracion, negocio_id } = req.body;
            
            // Generar código aleatorio
            const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Generar QR
            const qrCode = await qrService.generateDiscountQR(codigo, negocio_id);
            
            const result = await pool.query(
                `INSERT INTO codigos_descuento (
                    codigo, 
                    cliente_email, 
                    fecha_expiracion, 
                    negocio_id,
                    qr_code
                ) VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [codigo, cliente_email, fecha_expiracion, negocio_id, qrCode]
            );

            // Enviar email con el código
            try {
                await emailService.sendDiscountCode(cliente_email, codigo, qrCode);
            } catch (emailError) {
                console.error('Error al enviar email:', emailError);
            }

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error al crear código:', error);
            res.status(500).json({ error: 'Error al crear el código de descuento' });
        }
    }

    async validar(req, res) {
        try {
            const { codigo } = req.body;
            const negocio_id = req.user.id;

            await pool.query('BEGIN');

            const result = await pool.query(
                `SELECT * FROM codigos_descuento 
                WHERE codigo = $1 AND (negocio_id IS NULL OR negocio_id = $2)
                AND estado = true AND fecha_expiracion > NOW()`,
                [codigo, negocio_id]
            );

            if (result.rows.length === 0) {
                await pool.query('ROLLBACK');
                return res.status(404).json({ error: 'Código inválido o expirado' });
            }

            // Registrar el canje
            const canjeResult = await pool.query(
                `INSERT INTO canjes (codigo_descuento_id, negocio_id, metodo_canje)
                VALUES ($1, $2, $3)
                RETURNING id`,
                [result.rows[0].id, negocio_id, 'manual']
            );

            // Registrar el pago pendiente
            const fecha = new Date();
            const mes = fecha.getMonth() + 1;
            const año = fecha.getFullYear();

            // Buscar o crear registro de facturación para el mes actual
            let facturacionResult = await pool.query(
                `SELECT id FROM facturacion 
                WHERE negocio_id = $1 AND mes = $2 AND año = $3`,
                [negocio_id, mes, año]
            );

            let facturacionId;
            if (facturacionResult.rows.length === 0) {
                // Crear nuevo registro de facturación
                const newFacturacion = await pool.query(
                    `INSERT INTO facturacion (negocio_id, mes, año, total_codigos, monto_total)
                    VALUES ($1, $2, $3, 1, 50)
                    RETURNING id`,
                    [negocio_id, mes, año]
                );
                facturacionId = newFacturacion.rows[0].id;
            } else {
                facturacionId = facturacionResult.rows[0].id;
                // Actualizar totales
                await pool.query(
                    `UPDATE facturacion 
                    SET total_codigos = total_codigos + 1,
                        monto_total = monto_total + 50
                    WHERE id = $1`,
                    [facturacionId]
                );
            }

            // Registrar el pago individual
            await pool.query(
                `INSERT INTO pagos_codigos (
                    canje_id, 
                    negocio_id, 
                    monto,
                    facturacion_id
                ) VALUES ($1, $2, $3, $4)`,
                [canjeResult.rows[0].id, negocio_id, 50, facturacionId]
            );

            // Desactivar el código
            await pool.query(
                'UPDATE codigos_descuento SET estado = false WHERE id = $1',
                [result.rows[0].id]
            );

            await pool.query('COMMIT');

            res.json({ 
                mensaje: 'Código validado exitosamente',
                codigo: result.rows[0]
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ error: 'Error al validar el código' });
        }
    }

    async listar(req, res) {
        try {
            const result = await pool.query(
                `SELECT cd.*, n.nombre as negocio_nombre 
                FROM codigos_descuento cd
                LEFT JOIN negocios n ON cd.negocio_id = n.id
                ORDER BY cd.fecha_creacion DESC`
            );
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar los códigos' });
        }
    }

    async obtenerCanjes(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query(
                `SELECT c.*, cd.codigo, cd.cliente_email, n.nombre as negocio_nombre
                FROM canjes c
                JOIN codigos_descuento cd ON c.codigo_descuento_id = cd.id
                JOIN negocios n ON c.negocio_id = n.id
                WHERE cd.id = $1
                ORDER BY c.fecha_canje DESC`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.json({
                    codigo: null,
                    canjes: []
                });
            }

            // Obtener información del código
            const codigoInfo = await pool.query(
                'SELECT codigo, cliente_email, fecha_creacion, fecha_expiracion FROM codigos_descuento WHERE id = $1',
                [id]
            );

            res.json({
                codigo: codigoInfo.rows[0],
                canjes: result.rows
            });
        } catch (error) {
            console.error('Error al obtener canjes:', error);
            res.status(500).json({ error: 'Error al obtener los canjes del código' });
        }
    }

    async getCount(req, res) {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM codigos_descuento');
            res.json({ count: parseInt(result.rows[0].count) });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el conteo de códigos' });
        }
    }

    async obtenerCanjesPorNegocio(req, res) {
        try {
            const { negocioId } = req.params;
            const result = await pool.query(
                `SELECT c.*, cd.codigo, cd.cliente_email 
                FROM canjes c
                JOIN codigos_descuento cd ON c.codigo_descuento_id = cd.id
                WHERE c.negocio_id = $1
                ORDER BY c.fecha_canje DESC`,
                [negocioId]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener canjes por negocio:', error);
            res.status(500).json({ error: 'Error al obtener los canjes del negocio' });
        }
    }

    async validarPublico(req, res) {
        try {
            const { codigo } = req.body;

            // Verificar si el código existe y está activo
            const result = await pool.query(
                `SELECT cd.*, n.nombre as negocio_nombre 
                FROM codigos_descuento cd
                LEFT JOIN negocios n ON cd.negocio_id = n.id
                WHERE cd.codigo = $1 AND cd.estado = true 
                AND cd.fecha_expiracion > NOW()`,
                [codigo]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    error: 'Código inválido o ya utilizado' 
                });
            }

            const codigoInfo = result.rows[0];

            // Registrar el canje
            await pool.query(
                `INSERT INTO canjes (
                    codigo_descuento_id, 
                    negocio_id, 
                    metodo_canje
                ) VALUES ($1, $2, $3)`,
                [codigoInfo.id, codigoInfo.negocio_id, 'qr']
            );

            // Desactivar el código
            await pool.query(
                'UPDATE codigos_descuento SET estado = false WHERE id = $1',
                [codigoInfo.id]
            );

            res.json({ 
                mensaje: `¡Gracias! Tu código ha sido canjeado exitosamente en ${codigoInfo.negocio_nombre}`,
                codigo: codigoInfo
            });
        } catch (error) {
            console.error('Error al validar código público:', error);
            res.status(500).json({ 
                error: 'Error al validar el código' 
            });
        }
    }
}

module.exports = new CodigosController(); 