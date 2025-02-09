const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const codigosRoutes = require('./codigos');
const negociosRoutes = require('./negocios');
const formulariosRoutes = require('./formularios');
const facturacionRoutes = require('./facturacion');

router.use('/auth', authRoutes);
router.use('/codigos', codigosRoutes);
router.use('/negocios', negociosRoutes);
router.use('/formularios', formulariosRoutes);
router.use('/facturacion', facturacionRoutes);

module.exports = router; 