const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Obtener estadísticas generales
router.get('/stats',
    authMiddleware,
    adminMiddleware,
    (req, res) => reportesController.getStats(req, res)
);

// Obtener reporte por período
router.get('/periodo',
    authMiddleware,
    adminMiddleware,
    (req, res) => reportesController.getReportePeriodo(req, res)
);

// Descargar reporte en Excel
router.get('/descargar',
    authMiddleware,
    adminMiddleware,
    (req, res) => reportesController.descargarReporte(req, res)
);

module.exports = router;
