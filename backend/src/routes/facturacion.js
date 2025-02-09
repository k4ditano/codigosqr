const express = require('express');
const router = express.Router();
const FacturacionController = require('../controllers/facturacionController');
const { auth, admin, isBusiness } = require('../middleware/auth');

// Rutas públicas
router.get('/count', FacturacionController.contarFacturas);

// Rutas para negocios
router.get('/negocio/:id', auth, isBusiness, FacturacionController.obtenerFacturasNegocio);
router.put('/:id/aceptar', auth, isBusiness, FacturacionController.aceptarFactura);
router.put('/:id/pagar', auth, isBusiness, FacturacionController.pagarFactura);

// Rutas protegidas que requieren admin
router.get('/', auth, admin, FacturacionController.listar);
router.post('/', auth, admin, FacturacionController.crear);
router.get('/:id', auth, admin, FacturacionController.obtener);
router.put('/:id', auth, admin, FacturacionController.actualizar);
router.delete('/:id', auth, admin, FacturacionController.eliminar);

module.exports = router; 