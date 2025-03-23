const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Middleware de autenticación y rol para todas las rutas
const authAdmin = [auth, checkRole(['admin'])];


// Obtener estadísticas generales
router.get('/stats', authAdmin, reportesController.getStats.bind(reportesController));

// Obtener reporte por período
router.get('/periodo', authAdmin, reportesController.getReportePeriodo.bind(reportesController));

// Descargar reporte en Excel
router.get('/descargar', authAdmin, reportesController.descargarReporte.bind(reportesController));

module.exports = router;
