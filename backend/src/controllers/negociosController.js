const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');
const qrService = require('../services/qrService');

class NegociosController {
    async crear(req, res) {
        try {
            console.log('Datos recibidos:', req.body);
            const { nombre, email, telefono } = req.body;
            
            // Validar datos requeridos
            if (!nombre || !email) {
                return res.status(400).json({ 
                    error: 'Nombre y email son requeridos' 
                });
            }
            
            // Generar credenciales
            const usuario = email.split('@')[0];
            const passwordTemp = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(passwordTemp, 10);
            
            // Insertar negocio sin QR inicialmente
            const result = await pool.query(
                `INSERT INTO negocios (
                    nombre, 
                    email, 
                    telefono, 
                    usuario, 
                    password,
                    role,
                    estado
                ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING id`,
                [nombre, email, telefono, usuario, hashedPassword, 'business', true]
            );

            const negocioId = result.rows[0].id;

            // Generar y actualizar QR
            try {
                console.log('Generando QR para el negocio:', negocioId);
                const qrCode = await qrService.generateBusinessQR(
                    negocioId,
                    process.env.BASE_URL || 'http://localhost:3000'
                );

                await pool.query(
                    'UPDATE negocios SET codigo_qr = $1 WHERE id = $2',
                    [qrCode, negocioId]
                );
            } catch (qrError) {
                console.error('Error al generar QR:', qrError);
                // Continuamos aunque falle la generación del QR
            }

            // Intentar enviar email
            try {
                console.log('Enviando credenciales por email...');
                await emailService.sendBusinessCredentials(email, usuario, passwordTemp);
            } catch (emailError) {
                console.error('Error al enviar email:', emailError);
                // No retornamos error, solo lo logueamos
            }

            res.status(201).json({ 
                mensaje: 'Negocio creado exitosamente',
                id: negocioId,
                credenciales: {
                    usuario,
                    password: passwordTemp
                }
            });
        } catch (error) {
            console.error('Error detallado al crear negocio:', error);
            if (error.code === '23505') { // Error de duplicado
                res.status(400).json({ 
                    error: 'Ya existe un negocio con ese email o usuario' 
                });
            } else {
                res.status(500).json({ 
                    error: 'Error al crear el negocio',
                    detalle: error.message 
                });
            }
        }
    }

    async listar(req, res) {
        try {
            console.log('Listando negocios...');
            const result = await pool.query(
                `SELECT 
                    id, 
                    nombre, 
                    email, 
                    telefono, 
                    estado, 
                    usuario,
                    role,
                    COALESCE(created_at, CURRENT_TIMESTAMP) as created_at 
                FROM negocios 
                WHERE role != $1 
                ORDER BY created_at DESC`,
                ['admin']
            );
            console.log('Negocios encontrados:', result.rows.length);
            res.json(result.rows);
        } catch (error) {
            console.error('Error detallado al listar negocios:', error);
            res.status(500).json({ 
                error: 'Error al listar los negocios',
                detalle: error.message 
            });
        }
    }

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, email, telefono, estado } = req.body;

            await pool.query(
                `UPDATE negocios 
                SET nombre = $1, email = $2, telefono = $3, estado = $4
                WHERE id = $5`,
                [nombre, email, telefono, estado, id]
            );

            res.json({ mensaje: 'Negocio actualizado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar el negocio' });
        }
    }

    async obtener(req, res) {
        try {
            const { id } = req.params;
            console.log('Obteniendo negocio con ID:', id);
            
            const result = await pool.query(
                'SELECT id, nombre, email, telefono, estado, codigo_qr FROM negocios WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' });
            }

            // Si el QR no existe, generarlo
            if (!result.rows[0].codigo_qr) {
                const qrCode = await qrService.generateBusinessQR(
                    id,
                    process.env.BASE_URL || 'http://localhost:3000'
                );
                
                await pool.query(
                    'UPDATE negocios SET codigo_qr = $1 WHERE id = $2',
                    [qrCode, id]
                );
                
                result.rows[0].codigo_qr = qrCode;
            }

            console.log('Negocio encontrado:', result.rows[0]);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener negocio:', error);
            res.status(500).json({ error: 'Error al obtener el negocio' });
        }
    }

    async getCount(req, res) {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM negocios WHERE role != $1', ['admin']);
            res.json({ count: parseInt(result.rows[0].count) });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el conteo de negocios' });
        }
    }

    async obtenerQR(req, res) {
        try {
            const { id } = req.params;
            console.log('Obteniendo QR para negocio:', id);

            const result = await pool.query(
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
                await pool.query(
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
        }
    }
}

module.exports = new NegociosController(); 