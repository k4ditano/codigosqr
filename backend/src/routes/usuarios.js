const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Listar usuarios
router.get('/',
    authMiddleware,
    adminMiddleware,
    (req, res) => usuariosController.listar(req, res)
);

// Actualizar usuario
router.put('/:id',
    authMiddleware,
    adminMiddleware,
    (req, res) => usuariosController.actualizar(req, res)
);

// Cambiar estado de usuario
router.patch('/:id/estado',
    authMiddleware,
    adminMiddleware,
    (req, res) => usuariosController.cambiarEstado(req, res)
);

// Resetear contraseña
router.post('/:id/resetear-password',
    authMiddleware,
    adminMiddleware,
    (req, res) => usuariosController.resetearPassword(req, res)
);

module.exports = router;
