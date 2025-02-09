# Guía de Solución de Problemas

## Problemas de Autenticación

### Error 401/404 en Login

Si encuentras errores 401 (Unauthorized) o 404 (Not Found) al intentar hacer login:

1. **Verificar Rutas API**
```javascript
// ❌ Mal: Rutas duplicadas
baseURL: 'http://localhost:5000/api'
axiosClient.post('/api/auth/login', credentials) // Resulta en /api/api/auth/login

// ✅ Bien: Rutas correctas
baseURL: 'http://localhost:5000/api'
axiosClient.post('/auth/login', credentials) // Resulta en /api/auth/login
```

2. **Configuración de Axios**
```javascript
// config/axios.js
const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptores para debugging
axiosClient.interceptors.request.use(request => {
    console.log('Request:', {
        url: request.url,
        method: request.method,
        baseURL: request.baseURL,
        headers: request.headers,
        data: request.data
    });
    return request;
});
```

3. **Manejo de Errores Mejorado**
```javascript
try {
    const response = await axiosClient.post('/auth/login', credentials);
    // ... manejo de respuesta
} catch (error) {
    console.error('Error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
    });
    throw error;
}
```

### Scripts de Verificación

1. **Verificar Usuario Admin**
```bash
# scripts/verify_admin.sh
#!/bin/bash
# Verifica si el usuario admin existe y sus credenciales son correctas
# Uso: ./scripts/verify_admin.sh
```

2. **Resetear Usuario Admin**
```bash
# scripts/reset_admin.sh
#!/bin/bash
# Elimina y recrea el usuario admin con credenciales por defecto
# Uso: ./scripts/reset_admin.sh
```

## Estructura de Base de Datos

### Tabla de Usuarios
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuración del Entorno

### Variables de Entorno (.env)
```plaintext
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=sistema_descuentos
DB_PASSWORD=tu_password
DB_PORT=5432

# JWT
JWT_SECRET=tu_secreto_jwt

# Server
PORT=5000
```

## Error 500 en Peticiones GET

### Error al Cargar Códigos/Negocios

Si encuentras errores 500 al hacer peticiones GET después de iniciar sesión:

1. **Verificar Token en Headers**
```javascript
// Interceptor de Axios
axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});
```

2. **Verificar Middleware de Autenticación en Backend**
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('Token no proporcionado');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(401).json({ error: 'No autorizado' });
    }
};
```

3. **Debugging en Backend**
```javascript
// routes/codigos.js
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('Usuario autenticado:', req.user);
        const result = await pool.query('SELECT * FROM codigos');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener códigos:', error);
        res.status(500).json({ 
            error: 'Error al obtener códigos',
            details: error.message 
        });
    }
});
```

## Lista de Verificación para Debugging

1. **Frontend**
   - [ ] Verificar rutas en las peticiones axios
   - [ ] Comprobar que los headers están correctos
   - [ ] Revisar el manejo de errores
   - [ ] Verificar los logs de la consola
   - [ ] Verificar que el token JWT está presente en localStorage
   - [ ] Comprobar que el token se envía en los headers

2. **Backend**
   - [ ] Comprobar que las rutas están bien definidas
   - [ ] Verificar las variables de entorno
   - [ ] Revisar los logs del servidor
   - [ ] Comprobar la conexión a la base de datos
   - [ ] Verificar el middleware de autenticación
   - [ ] Comprobar que las rutas protegidas usan el middleware

## Comandos Útiles

```bash
# Verificar usuario admin
./scripts/verify_admin.sh

# Resetear usuario admin
./scripts/reset_admin.sh

# Ver logs del servidor en tiempo real
tail -f backend/logs/server.log

# Verificar estructura de la base de datos
psql -U postgres -d sistema_descuentos -c "\d+ usuarios"

# Ver los últimos logs de error del backend
tail -f backend/logs/error.log

# Verificar la estructura de la tabla códigos
psql -U postgres -d sistema_descuentos -c "\d+ codigos"

# Verificar los registros en la tabla códigos
psql -U postgres -d sistema_descuentos -c "SELECT * FROM codigos;"
```

## Recursos y Referencias

- [Documentación de Axios](https://axios-http.com/docs/intro)
- [Manejo de JWT](https://jwt.io/)
- [Debugging en Node.js](https://nodejs.org/en/docs/guides/debugging-getting-started) 