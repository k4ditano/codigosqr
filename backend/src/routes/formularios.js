const express = require('express');
const router = express.Router();
const formulariosController = require('../controllers/formulariosController');
const { auth, isAdmin, isBusiness } = require('../middleware/auth');

// Ruta pública para enviar formulario
router.post('/', formulariosController.crear);

// Rutas protegidas
router.get('/', auth, isAdmin, formulariosController.listar);
router.get('/negocio/:negocio_id', auth, isBusiness, formulariosController.listarPorNegocio);

// Agregar esta ruta
router.get('/count', auth, isAdmin, formulariosController.getCount);

module.exports = router; 