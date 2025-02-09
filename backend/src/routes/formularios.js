const express = require('express');
const router = express.Router();
const formulariosController = require('../controllers/formulariosController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rutas públicas
router.post('/', (req, res) => formulariosController.crear(req, res));

// Ruta de conteo - MOVER ANTES de las rutas con parámetros
router.get('/count', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => formulariosController.obtenerConteo(req, res)
);

// Rutas protegidas (admin)
router.get('/', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => formulariosController.listar(req, res)
);

router.get('/:id', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => formulariosController.obtener(req, res)
);

router.put('/:id/atender', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => formulariosController.marcarAtendido(req, res)
);

module.exports = router; 