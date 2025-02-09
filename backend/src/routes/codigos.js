const express = require('express');
const router = express.Router();
const codigosController = require('../controllers/codigosController');
const { auth, isAdmin, isBusiness } = require('../middleware/auth');

// Rutas para administrador
router.post('/', auth, isAdmin, codigosController.crear);
router.get('/', auth, isAdmin, codigosController.listar);
router.get('/count', auth, isAdmin, codigosController.getCount);

// Ruta para ver canjes de un código específico
router.get('/:id/canjes', auth, isAdmin, codigosController.obtenerCanjes);

// Rutas para negocios
router.post('/validar', auth, isBusiness, codigosController.validar);
router.get('/canjes/negocio/:negocioId', auth, isBusiness, codigosController.obtenerCanjesPorNegocio);

// Ruta pública para validar código
router.post('/validar-publico', codigosController.validarPublico);

module.exports = router; 