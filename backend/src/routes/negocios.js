const express = require('express');
const router = express.Router();
const negociosController = require('../controllers/negociosController');
const { auth, isAdmin, isBusiness } = require('../middleware/auth');

// Rutas protegidas
router.get('/count', auth, isAdmin, negociosController.getCount);
router.post('/', auth, isAdmin, negociosController.crear);
router.get('/', auth, isAdmin, negociosController.listar);
router.put('/:id', auth, isAdmin, negociosController.actualizar);

// Ruta para obtener QR
router.get('/:id/qr', auth, negociosController.obtenerQR);

// Ruta para obtener negocio
router.get('/:id', auth, negociosController.obtener);

module.exports = router; 