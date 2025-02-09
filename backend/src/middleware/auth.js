const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No hay token de autenticación' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
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