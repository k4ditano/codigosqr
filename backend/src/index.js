const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const negociosRoutes = require('./routes/negocios');
const codigosRoutes = require('./routes/codigos');
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/formularios');
const facturacionRoutes = require('./routes/facturacion');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://145.223.100.119',  // Permitir solo la IP del VPS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Middleware para logging de rutas (debug)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    if (req.method === 'POST') {
        console.log('Body:', req.body);
    }
    next();
});

// Rutas
app.use('/api/negocios', negociosRoutes);
app.use('/api/codigos', codigosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/formularios', formRoutes);
app.use('/api/facturacion', facturacionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
}); 