const { Pool } = require('pg');

class FacturacionController {
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
                    f.*,
                    n.nombre as negocio_nombre,
                    to_char(f.fecha_emision, 'DD/MM/YYYY HH24:MI') as fecha_emision_formato,
                    to_char(f.fecha_aceptacion, 'DD/MM/YYYY HH24:MI') as fecha_aceptacion_formato,
                    to_char(f.fecha_pago, 'DD/MM/YYYY HH24:MI') as fecha_pago_formato
                FROM facturas f
                LEFT JOIN negocios n ON f.negocio_id = n.id
                ORDER BY f.fecha_emision DESC
            `);

            res.json(result.rows);
        } catch (error) {
            console.error('Error al listar facturas:', error);
            res.status(500).json({ 
                error: 'Error al listar las facturas',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async crear(req, res) {
        const client = await this.pool.connect();
        try {
            const { negocio_id, canje_id } = req.body;

            await client.query('BEGIN');

            // Verificar que el negocio existe
            const negocioExists = await client.query(
                'SELECT id FROM negocios WHERE id = $1',
                [negocio_id]
            );

            if (negocioExists.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            // Verificar que el canje existe y no tiene factura
            if (canje_id) {
                const canjeExists = await client.query(
                    'SELECT id FROM canjes WHERE id = $1',
                    [canje_id]
                );

                if (canjeExists.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ error: 'Canje no encontrado' });
                }

                const facturaExists = await client.query(
                    'SELECT id FROM facturas WHERE canje_id = $1',
                    [canje_id]
                );

                if (facturaExists.rows.length > 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({ error: 'Ya existe una factura para este canje' });
                }
            }

            const result = await client.query(
                `INSERT INTO facturas (
                    negocio_id, 
                    canje_id,
                    monto_descuento,
                    monto_ingreso,
                    estado,
                    fecha_emision
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
                RETURNING *`,
                [negocio_id, canje_id, 25.00, 25.00, 'pendiente']
            );

            await client.query('COMMIT');
            res.status(201).json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al crear factura:', error);
            res.status(500).json({ 
                error: 'Error al crear factura',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtener(req, res) {
        const client = await this.pool.connect();
        try {
            // Obtener detalles de la factura con información relacionada
            const result = await client.query(
                `SELECT f.*, 
                    n.nombre as negocio_nombre,
                    c.codigo_id,
                    cd.codigo as codigo_descuento,
                    cd.porcentaje as porcentaje_descuento
                FROM facturas f
                JOIN negocios n ON f.negocio_id = n.id
                LEFT JOIN canjes c ON f.canje_id = c.id
                LEFT JOIN codigos cd ON c.codigo_id = cd.id
                WHERE f.id = $1`,
                [req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Factura no encontrada' });
            }

            // Formatear fechas y agregar información adicional
            const factura = {
                ...result.rows[0],
                fecha_emision_formatted: new Date(result.rows[0].fecha_emision).toLocaleDateString(),
                fecha_pago_formatted: result.rows[0].fecha_pago ? 
                    new Date(result.rows[0].fecha_pago).toLocaleDateString() : null
            };

            res.json(factura);
        } catch (error) {
            console.error('Error al obtener factura:', error);
            res.status(500).json({ 
                error: 'Error al obtener la factura',
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
            const { estado } = req.body;

            let fechaColumna = '';
            switch (estado) {
                case 'aceptada':
                    fechaColumna = 'fecha_aceptacion';
                    break;
                case 'pagada':
                    fechaColumna = 'fecha_pago';
                    break;
                default:
                    fechaColumna = null;
            }

            const query = fechaColumna ? 
                `UPDATE facturas 
                 SET estado = $1, ${fechaColumna} = CURRENT_TIMESTAMP 
                 WHERE id = $2 
                 RETURNING *` :
                `UPDATE facturas 
                 SET estado = $1 
                 WHERE id = $2 
                 RETURNING *`;

            const result = await client.query(query, [estado, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Factura no encontrada' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al actualizar factura:', error);
            res.status(500).json({ 
                error: 'Error al actualizar factura',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async aceptarFactura(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            console.log('Intentando aceptar factura:', id);
            
            await client.query('BEGIN');

            // Primero verificar que la factura existe y está pendiente
            const facturaCheck = await client.query(
                'SELECT id, estado FROM facturas WHERE id = $1',
                [id]
            );
            console.log('Estado actual de la factura:', facturaCheck.rows[0]?.estado);

            if (facturaCheck.rows.length === 0) {
                console.log('Factura no encontrada');
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Factura no encontrada' });
            }

            if (facturaCheck.rows[0].estado !== 'pendiente') {
                console.log('Factura no está pendiente:', facturaCheck.rows[0].estado);
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'La factura no está en estado pendiente' });
            }

            // Actualizar estado y fecha
            const result = await client.query(
                `UPDATE facturas 
                SET estado = 'aceptada',
                    fecha_aceptacion = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *`,
                [id]
            );
            console.log('Factura actualizada:', result.rows[0]);

            await client.query('COMMIT');
            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error detallado al aceptar factura:', error);
            res.status(500).json({ 
                error: 'Error al aceptar la factura',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async marcarPagada(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            
            const result = await client.query(
                `UPDATE facturas 
                SET estado = 'pagada', 
                    fecha_pago = CURRENT_TIMESTAMP 
                WHERE id = $1 AND estado = 'aceptada'
                RETURNING *`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Factura no encontrada o no está aceptada' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al marcar factura como pagada:', error);
            res.status(500).json({ 
                error: 'Error al actualizar la factura',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtenerFacturacionNegocio(req, res) {
        const client = await this.pool.connect();
        try {
            const negocioId = parseInt(req.params.negocioId);
            const { desde, hasta, estado } = req.query;

            let query = `
                SELECT 
                    f.*,
                    c.codigo_id,
                    cd.codigo,
                    cd.email as cliente_email,
                    to_char(c.created_at, 'DD/MM/YYYY HH24:MI') as fecha_canje,
                    to_char(f.fecha_emision, 'DD/MM/YYYY HH24:MI') as fecha_emision_formato,
                    to_char(f.fecha_aceptacion, 'DD/MM/YYYY HH24:MI') as fecha_aceptacion_formato,
                    to_char(f.fecha_pago, 'DD/MM/YYYY HH24:MI') as fecha_pago_formato
                FROM facturas f
                LEFT JOIN canjes c ON f.canje_id = c.id
                LEFT JOIN codigos cd ON c.codigo_id = cd.id
                WHERE f.negocio_id = $1
            `;

            const params = [negocioId];
            let paramCount = 1;

            if (desde) {
                paramCount++;
                query += ` AND f.fecha_emision >= $${paramCount}`;
                params.push(new Date(desde));
            }

            if (hasta) {
                paramCount++;
                query += ` AND f.fecha_emision <= $${paramCount}`;
                params.push(new Date(hasta));
            }

            if (estado) {
                paramCount++;
                query += ` AND f.estado = $${paramCount}`;
                params.push(estado);
            }

            query += ` ORDER BY f.fecha_emision DESC`;

            const result = await client.query(query, params);

            res.json({
                facturas: result.rows,
                totales: {
                    total_pagado: parseFloat(result.rows.reduce((sum, f) => f.estado === 'pagada' ? sum + f.monto_total : sum, 0)),
                    total_pendiente: parseFloat(result.rows.reduce((sum, f) => f.estado === 'aceptada' ? sum + f.monto_total : sum, 0)),
                    total_por_aceptar: parseFloat(result.rows.reduce((sum, f) => f.estado === 'pendiente' ? sum + f.monto_total : sum, 0))
                }
            });
        } catch (error) {
            console.error('Error detallado:', error);
            res.status(500).json({ 
                error: 'Error al obtener la información de facturación',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async validarPago(req, res) {
        const client = await this.pool.connect();
        try {
            const { id } = req.params;
            
            await client.query('BEGIN');

            // Verificar que la factura existe y está en estado correcto
            const facturaResult = await client.query(
                `SELECT * FROM facturas 
                WHERE id = $1 AND estado = 'aceptada'`,
                [id]
            );

            if (facturaResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ 
                    error: 'Factura no encontrada o no está en estado aceptada' 
                });
            }

            // Actualizar estado de la factura
            const result = await client.query(
                `UPDATE facturas 
                SET estado = 'pagada', 
                    fecha_pago = CURRENT_TIMESTAMP 
                WHERE id = $1
                RETURNING *`,
                [id]
            );

            await client.query('COMMIT');

            res.json({
                mensaje: 'Pago validado correctamente',
                factura: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error al validar pago:', error);
            res.status(500).json({ 
                error: 'Error al validar el pago',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtenerResumenMensual(req, res) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    n.nombre as negocio,
                    DATE_TRUNC('month', f.fecha_emision) as mes,
                    COUNT(*) as total_codigos,
                    SUM(f.monto_total) as monto_total,
                    STRING_AGG(DISTINCT f.estado, ', ') as estados,
                    SUM(CASE WHEN f.estado = 'pendiente' THEN f.monto_total ELSE 0 END) as monto_pendiente,
                    SUM(CASE WHEN f.estado = 'aceptada' THEN f.monto_total ELSE 0 END) as monto_por_pagar,
                    SUM(CASE WHEN f.estado = 'pagada' THEN f.monto_total ELSE 0 END) as monto_pagado
                FROM facturas f
                JOIN negocios n ON f.negocio_id = n.id
                GROUP BY n.nombre, DATE_TRUNC('month', f.fecha_emision)
                ORDER BY mes DESC, n.nombre
            `);
            
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener resumen:', error);
            res.status(500).json({ 
                error: 'Error al obtener el resumen mensual',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }

    async obtenerResumenAdmin(req, res) {
        const client = await this.pool.connect();
        try {
            const { desde, hasta } = req.query;
            
            let query = `
                SELECT 
                    n.id as negocio_id,
                    n.nombre as negocio,
                    f.id as factura_id,
                    f.estado,
                    f.fecha_emision,
                    COUNT(*) OVER (PARTITION BY n.id) as total_facturas,
                    SUM(CASE WHEN f.estado = 'pendiente' THEN f.monto_total ELSE 0 END) OVER (PARTITION BY n.id) as monto_pendiente,
                    SUM(CASE WHEN f.estado = 'aceptada' THEN f.monto_total ELSE 0 END) OVER (PARTITION BY n.id) as monto_aceptado,
                    SUM(CASE WHEN f.estado = 'pagada' THEN f.monto_total ELSE 0 END) OVER (PARTITION BY n.id) as monto_pagado
                FROM facturas f
                JOIN negocios n ON f.negocio_id = n.id
                WHERE 1=1
            `;
            
            const params = [];
            if (desde) {
                params.push(new Date(desde));
                query += ` AND f.fecha_emision >= $${params.length}`;
            }
            if (hasta) {
                params.push(new Date(hasta));
                query += ` AND f.fecha_emision <= $${params.length}`;
            }
            
            query += ` ORDER BY n.nombre, f.fecha_emision DESC`;
            
            const result = await client.query(query, params);
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener resumen:', error);
            res.status(500).json({ 
                error: 'Error al obtener el resumen de facturación',
                details: error.message 
            });
        } finally {
            client.release();
        }
    }
}

module.exports = new FacturacionController(); 