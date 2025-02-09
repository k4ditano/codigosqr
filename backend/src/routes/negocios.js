const express = require('express');
const router = express.Router();
const NegociosController = require('../controllers/negociosController');
const { authMiddleware, adminMiddleware, isBusiness } = require('../middleware/auth');

const negociosController = new NegociosController();

// Ruta pública - DEBE IR ANTES de las rutas protegidas y con parámetros
router.get('/:id/public', (req, res) => negociosController.obtenerPublico(req, res));

// Ruta de conteo
router.get('/count',
    authMiddleware,
    adminMiddleware,
    (req, res) => negociosController.obtenerConteo(req, res)
);

// Rutas para administrador
router.post('/', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => negociosController.crear(req, res)
);

router.get('/', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => negociosController.listar(req, res)
);

// Rutas para negocios específicos
router.get('/:id', 
    authMiddleware, 
    (req, res) => negociosController.obtener(req, res)
);

// Ruta para eliminar negocios
router.delete('/:id', 
    authMiddleware,
    adminMiddleware,
    (req, res) => negociosController.eliminar(req, res)
);

// Añadir esta ruta para el QR
router.get('/:id/qr', 
    authMiddleware, 
    isBusiness,
    (req, res) => negociosController.obtenerQR(req, res)
);

module.exports = router; 