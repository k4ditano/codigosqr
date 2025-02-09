const express = require('express');
const router = express.Router();
const facturacionController = require('../controllers/facturacionController');
const { auth } = require('../middleware/auth');

// Rutas para negocio
router.get('/negocio/:negocioId', auth, facturacionController.obtenerFacturacionNegocio);

// Rutas para admin
router.get('/resumen', auth, facturacionController.obtenerResumenMensual);
router.post('/:facturacionId/validar', auth, facturacionController.validarPago);

module.exports = router; 