const pool = require('../config/db');

class FormulariosController {
    async crear(req, res) {
        try {
            const { nombre, email, telefono, negocio_id } = req.body;
            
            const result = await pool.query(
                `INSERT INTO formulario_clientes (nombre, email, telefono, negocio_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id`,
                [nombre, email, telefono, negocio_id]
            );

            res.status(201).json({
                mensaje: 'Formulario enviado exitosamente',
                id: result.rows[0].id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al procesar el formulario' });
        }
    }

    async listar(req, res) {
        try {
            const result = await pool.query(
                `SELECT f.*, n.nombre as negocio_nombre
                FROM formulario_clientes f
                JOIN negocios n ON f.negocio_id = n.id
                ORDER BY f.fecha_envio DESC`
            );
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar los formularios' });
        }
    }

    async listarPorNegocio(req, res) {
        try {
            const { negocio_id } = req.params;
            const result = await pool.query(
                `SELECT * FROM formulario_clientes
                WHERE negocio_id = $1
                ORDER BY fecha_envio DESC`,
                [negocio_id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar los formularios del negocio' });
        }
    }

    async getCount(req, res) {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM formulario_clientes');
            res.json({ count: parseInt(result.rows[0].count) });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el conteo de formularios' });
        }
    }
}

module.exports = new FormulariosController(); 