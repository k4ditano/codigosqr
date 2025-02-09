const express = require('express');
const router = express.Router();
const CodigosController = require('../controllers/codigosController');
const { auth, admin, isBusiness } = require('../middleware/auth');

// Rutas públicas
router.get('/count', CodigosController.contarCodigos);
router.get('/validar/:codigo', CodigosController.validarPublico);

// Rutas para negocios
router.post('/validar', auth, isBusiness, CodigosController.validar);
router.get('/canjes/negocio/:negocioId', auth, isBusiness, CodigosController.obtenerCanjesNegocio);

// Rutas protegidas que requieren admin
router.get('/', auth, admin, CodigosController.listar);
router.post('/', auth, admin, CodigosController.crear);
router.get('/:id/canjes', auth, admin, CodigosController.obtenerCanjes);
router.get('/:id', auth, admin, CodigosController.obtener);
router.put('/:id', auth, admin, CodigosController.actualizar);
router.delete('/:id', auth, admin, CodigosController.eliminar);

module.exports = router; 