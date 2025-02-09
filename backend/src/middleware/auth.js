const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No hay token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(401).json({ error: 'Token no válido' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de administrador' });
    }
    next();
};

const isBusiness = (req, res, next) => {
    if (!req.user || req.user.role !== 'business') {
        return res.status(403).json({ error: 'Acceso denegado: se requieren permisos de negocio' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, isBusiness }; 