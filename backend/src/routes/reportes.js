const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Middleware de autenticación y rol para todas las rutas
const authAdmin = [auth, checkRole(['admin'])];


// Obtener estadísticas generales
router.get('/stats', ...authAdmin, (req, res) => reportesController.getStats(req, res));

// Obtener reporte por período
router.get('/periodo', ...authAdmin, (req, res) => reportesController.getReportePeriodo(req, res));

// Descargar reporte en Excel
router.get('/descargar', ...authAdmin, (req, res) => reportesController.descargarReporte(req, res));

module.exports = router;
