const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Rutas públicas
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Rutas protegidas
router.get('/profile', auth, AuthController.getProfile);
router.post('/logout', auth, AuthController.logout);
router.put('/password', auth, AuthController.changePassword);

module.exports = router; 