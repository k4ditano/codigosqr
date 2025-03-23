const { Pool } = require('pg');
const ExcelJS = require('exceljs');

class ReportesController {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    async getStats(req, res) {
        const client = await this.pool.connect();
        try {
            // Total códigos y activos
            const codigosResult = await client.query(`
                SELECT 
                    COUNT(DISTINCT c.id) as total,
                    SUM(CASE WHEN c.estado = true AND c.fecha_fin >= CURRENT_DATE THEN 1 ELSE 0 END) as activos,
                    COUNT(DISTINCT cj.id) as canjeados
                FROM codigos c
                LEFT JOIN canjes cj ON c.id = cj.codigo_id
            `);

            // Total negocios y activos
            const negociosResult = await client.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as activos
                FROM negocios
            `);

            res.json({
                totalCodigos: parseInt(codigosResult.rows[0].total),
                codigosActivos: parseInt(codigosResult.rows[0].activos),
                codigosCanjeados: parseInt(codigosResult.rows[0].canjeados),
                totalNegocios: parseInt(negociosResult.rows[0].total),
                negociosActivos: parseInt(negociosResult.rows[0].activos)
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        } finally {
            client.release();
        }
    }

    async getReportePeriodo(req, res) {
        const client = await this.pool.connect();
        try {
            const { fechaInicio, fechaFin } = req.query;

            // Códigos generados por día
            const codigosGeneradosResult = await client.query(`
                SELECT DATE(created_at) as fecha, COUNT(*) as cantidad
                FROM codigos
                WHERE created_at BETWEEN $1 AND $2
                GROUP BY DATE(created_at)
                ORDER BY fecha
            `, [fechaInicio, fechaFin]);

            // Códigos canjeados por día
            const codigosCanjeadosResult = await client.query(`
                SELECT DATE(fecha_canje) as fecha, COUNT(*) as cantidad
                FROM codigos
                WHERE fecha_canje BETWEEN $1 AND $2
                GROUP BY DATE(fecha_canje)
                ORDER BY fecha
            `, [fechaInicio, fechaFin]);

            // Negocios registrados por día
            const negociosRegistradosResult = await client.query(`
                SELECT DATE(created_at) as fecha, COUNT(*) as cantidad
                FROM negocios
                WHERE created_at BETWEEN $1 AND $2
                GROUP BY DATE(created_at)
                ORDER BY fecha
            `, [fechaInicio, fechaFin]);

            res.json({
                codigosGenerados: codigosGeneradosResult.rows,
                codigosCanjeados: codigosCanjeadosResult.rows,
                negociosRegistrados: negociosRegistradosResult.rows
            });
        } catch (error) {
            console.error('Error al obtener reporte por período:', error);
            res.status(500).json({ error: 'Error al obtener reporte por período' });
        } finally {
            client.release();
        }
    }

    async descargarReporte(req, res) {
        const client = await this.pool.connect();
        try {
            const { fechaInicio, fechaFin } = req.query;

            // Obtener datos
            const codigosResult = await client.query(`
                SELECT 
                    c.codigo,
                    c.email,
                    c.porcentaje,
                    c.created_at as fecha_creacion,
                    c.fecha_canje,
                    c.canjeado,
                    n.nombre as negocio
                FROM codigos c
                LEFT JOIN negocios n ON c.negocio_id = n.id
                WHERE c.created_at BETWEEN $1 AND $2
                ORDER BY c.created_at DESC
            `, [fechaInicio, fechaFin]);

            // Crear workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reporte de Códigos');

            // Definir columnas
            worksheet.columns = [
                { header: 'Código', key: 'codigo', width: 15 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Descuento %', key: 'porcentaje', width: 15 },
                { header: 'Fecha Creación', key: 'fecha_creacion', width: 20 },
                { header: 'Fecha Canje', key: 'fecha_canje', width: 20 },
                { header: 'Estado', key: 'estado', width: 15 },
                { header: 'Negocio', key: 'negocio', width: 30 }
            ];

            // Agregar datos
            codigosResult.rows.forEach(row => {
                worksheet.addRow({
                    codigo: row.codigo,
                    email: row.email,
                    porcentaje: row.porcentaje,
                    fecha_creacion: row.fecha_creacion.toLocaleDateString(),
                    fecha_canje: row.fecha_canje ? row.fecha_canje.toLocaleDateString() : '-',
                    estado: row.canjeado ? 'Canjeado' : 'Pendiente',
                    negocio: row.negocio || '-'
                });
            });

            // Estilo para el header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Configurar respuesta
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=reporte.xlsx'
            );

            // Enviar archivo
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Error al generar reporte:', error);
            res.status(500).json({ error: 'Error al generar reporte' });
        } finally {
            client.release();
        }
    }
}

module.exports = new ReportesController();
