const express = require('express');
const router = express.Router();
const NegociosController = require('../controllers/negociosController');
const { auth, admin } = require('../middleware/auth');

// Rutas públicas
router.get('/count', NegociosController.contarNegocios);

// Rutas protegidas que requieren autenticación y rol de admin
router.get('/', auth, admin, NegociosController.listar);
router.post('/', auth, admin, NegociosController.crear);
router.get('/:id', auth, admin, NegociosController.obtener);
router.put('/:id', auth, admin, NegociosController.actualizar);
router.delete('/:id', auth, admin, NegociosController.eliminar);

module.exports = router; 