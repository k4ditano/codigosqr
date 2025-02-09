const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    next();
};

const isBusiness = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.role !== 'business') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Verificar que el usuario business solo acceda a sus propios recursos
    const requestedId = parseInt(req.params.negocioId) || parseInt(req.params.id);
    if (requestedId && requestedId !== req.user.id) {
        return res.status(403).json({ error: 'No autorizado para acceder a estos recursos' });
    }

    next();
};

module.exports = { auth, isAdmin, isBusiness }; 