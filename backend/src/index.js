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
app.use(cors());
app.use(express.json());

// Middleware para logging de rutas (debug)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
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