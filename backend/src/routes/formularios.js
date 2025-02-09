const express = require('express');
const router = express.Router();
const FormulariosController = require('../controllers/formulariosController');
const { auth, admin } = require('../middleware/auth');

// Rutas públicas
router.get('/count', FormulariosController.contarFormularios);
router.post('/publico', FormulariosController.crearPublico);

// Rutas protegidas que requieren admin
router.get('/', auth, admin, FormulariosController.listar);
router.put('/:id/atender', auth, admin, FormulariosController.marcarAtendido);
router.delete('/:id', auth, admin, FormulariosController.eliminar);

module.exports = router; 