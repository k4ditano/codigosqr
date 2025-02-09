const express = require('express');
const router = express.Router();
const NegociosController = require('../controllers/negociosController');
const { auth, admin, isBusiness } = require('../middleware/auth');

// Rutas públicas
router.get('/count', NegociosController.contarNegocios);
router.get('/:id/public', NegociosController.obtenerPublico);

// Rutas para negocios
router.get('/:id/qr', auth, isBusiness, NegociosController.obtenerQR);
router.put('/:id/perfil', auth, isBusiness, NegociosController.actualizarPerfil);

// Rutas protegidas que requieren admin
router.get('/', auth, admin, NegociosController.listar);
router.post('/', auth, admin, NegociosController.crear);
router.get('/:id', auth, admin, NegociosController.obtener);
router.put('/:id', auth, admin, NegociosController.actualizar);
router.delete('/:id', auth, admin, NegociosController.eliminar);

module.exports = router; 