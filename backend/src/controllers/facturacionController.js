const pool = require('../config/db');

class FacturacionController {
    async obtenerFacturacionNegocio(req, res) {
        try {
            const { negocioId } = req.params;
            console.log('Obteniendo facturación para negocio:', negocioId);

            // Primero verificar si el negocio existe
            const negocioExists = await pool.query(
                'SELECT id FROM negocios WHERE id = $1',
                [negocioId]
            );

            if (negocioExists.rows.length === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            // Consulta principal
            const query = `
                SELECT 
                    f.id,
                    f.mes,
                    f.año,
                    f.total_codigos,
                    f.monto_total,
                    f.estado,
                    f.fecha_pago,
                    COALESCE(COUNT(pc.id), 0) as codigos_pagados,
                    COALESCE(SUM(CASE WHEN pc.estado = 'pagado' THEN pc.monto ELSE 0 END), 0) as monto_pagado
                FROM facturacion f
                LEFT JOIN pagos_codigos pc ON f.id = pc.facturacion_id
                WHERE f.negocio_id = $1
                GROUP BY f.id, f.mes, f.año, f.total_codigos, f.monto_total, f.estado, f.fecha_pago 
                ORDER BY f.año DESC, f.mes DESC
            `;

            console.log('Ejecutando query:', query);
            const result = await pool.query(query, [negocioId]);
            console.log('Resultados encontrados:', result.rows.length);

            res.json(result.rows);
        } catch (error) {
            console.error('Error detallado en facturación:', error);
            res.status(500).json({ 
                error: 'Error al obtener la facturación',
                details: error.message,
                stack: error.stack
            });
        }
    }

    async validarPago(req, res) {
        try {
            const { facturacionId } = req.params;
            
            await pool.query('BEGIN');

            // Actualizar estado de facturación
            await pool.query(
                `UPDATE facturacion 
                SET estado = 'pagado', fecha_pago = CURRENT_TIMESTAMP 
                WHERE id = $1`,
                [facturacionId]
            );

            // Actualizar estado de pagos individuales
            await pool.query(
                `UPDATE pagos_codigos 
                SET estado = 'pagado' 
                WHERE facturacion_id = $1`,
                [facturacionId]
            );

            await pool.query('COMMIT');

            res.json({ mensaje: 'Pago validado correctamente' });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error al validar pago:', error);
            res.status(500).json({ error: 'Error al validar el pago' });
        }
    }

    async obtenerResumenMensual(req, res) {
        try {
            const result = await pool.query(`
                SELECT 
                    n.nombre as negocio,
                    f.mes,
                    f.año,
                    f.total_codigos,
                    f.monto_total,
                    f.estado
                FROM facturacion f
                JOIN negocios n ON f.negocio_id = n.id
                ORDER BY f.año DESC, f.mes DESC, n.nombre
            `);
            
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener resumen:', error);
            res.status(500).json({ error: 'Error al obtener el resumen mensual' });
        }
    }
}

module.exports = new FacturacionController(); 