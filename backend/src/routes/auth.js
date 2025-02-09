const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Rutas públicas
router.post('/login', (req, res) => authController.login(req, res));

// Rutas protegidas
router.get('/profile', 
    authMiddleware, 
    (req, res) => authController.getProfile(req, res)
);

// Rutas de administrador
router.post('/register', 
    authMiddleware, 
    adminMiddleware,
    (req, res) => authController.register(req, res)
);

module.exports = router; 