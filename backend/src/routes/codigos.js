const express = require('express');
const router = express.Router();
const CodigosController = require('../controllers/codigosController');
const { authMiddleware, adminMiddleware, isBusiness } = require('../middleware/auth');

// Crear una instancia del controlador
const codigosController = new CodigosController();

// Ruta de conteo - DEBE IR ANTES de las rutas con parámetros
router.get('/count',
    authMiddleware,
    adminMiddleware,
    (req, res) => codigosController.getCount(req, res)
);

// Rutas públicas (sin autenticación)
router.get('/validar/:codigo', 
    (req, res) => codigosController.validarPublico(req, res)
);

// Rutas para negocios
router.post('/validar', 
    authMiddleware, 
    isBusiness,
    (req, res) => codigosController.validar(req, res)
);

router.get('/canjes/negocio/:negocioId', 
    authMiddleware, 
    isBusiness,
    (req, res) => codigosController.obtenerCanjesPorNegocio(req, res)
);

router.post('/', 
    authMiddleware,
    adminMiddleware,
    (req, res) => codigosController.crear(req, res)
);

// Rutas para administradores
router.get('/', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => codigosController.listar(req, res)
);

// Rutas específicas (deben ir al final para evitar conflictos con rutas anteriores)
router.get('/:id/canjes', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => codigosController.obtenerCanjes(req, res)
);

router.get('/:id', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => codigosController.obtener(req, res)
);

router.put('/:id', 
    authMiddleware, 
    isBusiness,
    (req, res) => codigosController.actualizar(req, res)
);

router.delete('/:id', 
    authMiddleware, 
    isBusiness,
    (req, res) => codigosController.eliminar(req, res)
);

module.exports = router; 