## Manejo de Fechas y Datos en la Tabla de Códigos

### Backend (codigosController.js)
```javascript
// En el método listar
const result = await pool.query(`
    SELECT 
        c.id,
        c.codigo,
        c.email,
        c.estado,
        c.negocio_id,
        n.nombre as negocio_nombre,
        c.codigo_qr,
        c.created_at,
        c.fecha_fin,
        to_char(c.created_at, 'DD/MM/YYYY HH24:MI') as fecha_creacion,
        to_char(c.fecha_fin, 'DD/MM/YYYY HH24:MI') as fecha_expiracion
    FROM codigos c
    LEFT JOIN negocios n ON c.negocio_id = n.id
    ORDER BY c.created_at DESC
`);
```

### Frontend (Codigos.js)
```javascript
<TableCell>
    {codigo.fecha_creacion || 
     (codigo.created_at && new Date(codigo.created_at).toLocaleString('es-ES'))}
</TableCell>
<TableCell>
    {codigo.fecha_expiracion || 
     (codigo.fecha_fin && new Date(codigo.fecha_fin).toLocaleString('es-ES'))}
</TableCell>
```

### Base de Datos (create_tables.sql)
```sql
CREATE TABLE IF NOT EXISTS codigos (
    id SERIAL PRIMARY KEY,
    negocio_id INTEGER REFERENCES negocios(id),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    porcentaje INTEGER NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NOT NULL,
    codigo_qr TEXT,
    email VARCHAR(100),
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Puntos Clave
1. Formatear fechas directamente en SQL usando `to_char`
2. Mantener campos de fecha originales como respaldo
3. Usar `toLocaleString('es-ES')` en el frontend como fallback
4. Campos TIMESTAMP en la base de datos para precisión
5. Valores por defecto usando CURRENT_TIMESTAMP
6. Generar URLs de canje para QR usando variable de entorno FRONTEND_URL
7. Validación de permisos de negocio para canjear códigos
8. Manejo de nombres de negocios en la tabla

### Manejo de Nombres de Negocios
```javascript
// En el frontend (Codigos.js)
<TableCell>
    {codigo.negocio_id ? (
        negocios.find(n => n.id === codigo.negocio_id)?.nombre || 'Todos'
    ) : 'Todos'}
</TableCell>
```

### Protección de Rutas
```javascript
// Middleware de autenticación para rutas protegidas
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};
```

### Generación de QR
```javascript
// En codigosController.js
const urlValidacion = `${process.env.FRONTEND_URL}/canjear/${codigo}`;
const qr = await qrcode.toDataURL(urlValidacion);
```

### Variables de Entorno Necesarias
```env
FRONTEND_URL=http://localhost:3000
```

### Validación de Códigos
```javascript
// Verificar permisos del negocio
const result = await pool.query(
    `SELECT cd.*, n.nombre as negocio_nombre 
    FROM codigos cd
    LEFT JOIN negocios n ON cd.negocio_id = n.id
    WHERE cd.codigo = $1 
    AND cd.estado = true 
    AND cd.fecha_fin > NOW()
    AND (cd.negocio_id IS NULL OR cd.negocio_id = $2)`,
    [codigo, negocio_id]
);
```

# Solución de Errores en Sistema de Descuentos

## Problema con Eliminación de Negocios

### Cambios Realizados:

1. **Controlador de Negocios (negociosController.js)**
   - Implementación del método eliminar con eliminación en cascada
   - Orden de eliminación:
     1. Eliminar canjes asociados
     2. Eliminar códigos
     3. Eliminar facturas
     4. Eliminar negocio
     5. Eliminar usuario asociado
   - Todo dentro de una transacción para mantener integridad

2. **Rutas de Negocios (routes/negocios.js)**
   - Cambio de `isAdmin` a `adminMiddleware`
   - Formato consistente en todas las rutas
   - Uso correcto de middleware de autenticación

3. **Middleware de Autenticación (middleware/auth.js)**
   - Estandarización de nombres (adminMiddleware en lugar de isAdmin)
   - Mejora en mensajes de error
   - Verificación más robusta de permisos

4. **Controladores y Rutas Relacionadas**
   - Corrección en la exportación de controladores (usar instancia)
   - Estandarización del formato de rutas
   - Mejora en el manejo de errores

### Patrones Importantes:

1. **Exportación de Controladores**
   ```javascript
   module.exports = new MiControlador();
   ```

2. **Formato de Rutas**
   ```javascript
   router.metodo('ruta',
       authMiddleware,
       adminMiddleware,
       (req, res) => controlador.metodo(req, res)
   );
   ```

3. **Manejo de Transacciones**
   ```javascript
   const client = await this.pool.connect();
   try {
       await client.query('BEGIN');
       // operaciones
       await client.query('COMMIT');
   } catch (error) {
       await client.query('ROLLBACK');
   } finally {
       client.release();
   }
   ```

### Consideraciones Importantes:

1. **Orden de Eliminación**
   - Respetar las dependencias de claves foráneas
   - Eliminar primero las tablas hijas
   - Usar transacciones para mantener consistencia

2. **Middleware**
   - Usar nombres consistentes
   - Verificar permisos adecuadamente
   - Mantener la cadena de middleware ordenada

3. **Controladores**
   - Exportar instancias, no clases
   - Usar pool de conexiones consistentemente
   - Manejar errores apropiadamente

4. **Rutas**
   - Organizar por tipo de acceso (admin, negocio, público)
   - Usar middleware de autenticación consistentemente
   - Mantener formato consistente 