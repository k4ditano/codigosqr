const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Todas las rutas requieren autenticación y rol de admin
router.use(auth);
router.use(checkRole(['admin']));

// Obtener estadísticas generales
router.get('/stats', reportesController.getStats.bind(reportesController));

// Obtener reporte por período
router.get('/periodo', reportesController.getReportePeriodo.bind(reportesController));

// Descargar reporte en Excel
router.get('/descargar', reportesController.descargarReporte.bind(reportesController));

module.exports = router;
