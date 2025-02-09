const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authMiddleware, adminMiddleware, isBusiness } = require('../middleware/auth');
const facturacionController = require('../controllers/facturacionController');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Rutas para administradores
router.get('/', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => facturacionController.obtenerResumenAdmin(req, res)
);

router.put('/:id/aceptar', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => facturacionController.aceptarFactura(req, res)
);

router.put('/:id/pagar', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => facturacionController.marcarPagada(req, res)
);

// Rutas para negocios
router.get('/negocio/:negocioId', 
    authMiddleware, 
    isBusiness,
    (req, res) => facturacionController.obtenerFacturacionNegocio(req, res)
);

// Ruta para obtener una factura específica
router.get('/:id', 
    authMiddleware, 
    (req, res) => facturacionController.obtener(req, res)
);

module.exports = router; 