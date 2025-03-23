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

## Manejo de Fechas y Datos en la Tabla de Facturas
### Backend (facturacionController.js)
```javascript
// En el método listar facturas
const result = await pool.query(`
    SELECT 
        f.id,
        f.negocio_id,
        n.nombre as negocio_nombre,
        f.total,
        f.estado,
        f.detalles,
        to_char(f.fecha_emision, 'DD/MM/YYYY HH24:MI') as fecha_emision
    FROM facturas f
    LEFT JOIN negocios n ON f.negocio_id = n.id
    ORDER BY f.fecha_emision DESC
`);
```

### Frontend (Facturacion.js)
```javascript
<TableCell>
    {factura.fecha_emision || 
     (factura.fecha_emision && new Date(factura.fecha_emision).toLocaleString('es-ES'))}
</TableCell>
```

### Base de Datos (create_tables.sql)
```sql
CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    negocio_id INTEGER REFERENCES negocios(id),
    total DECIMAL(10,2) NOT NULL,
    fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'pendiente',
    detalles JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Puntos Clave del Sistema de Facturación
1. Generación automática al procesar canjes
2. Historial detallado por negocio
3. Estados de factura: pendiente, pagada, cancelada
4. Integración con sistema de notificaciones
5. Reportes y estadísticas

## Actualización del Formulario de Negocios
### Implementación del Campo Email Asociado
1. **Frontend (Negocios.js)**
   - Añadido campo "Email para Notificaciones" en el formulario
   - Separación clara entre email principal y email de notificaciones
   - Mensajes de ayuda descriptivos para cada campo:
     - Email principal: Para inicio de sesión y gestión
     - Email de notificaciones: Para recibir notificaciones de formularios (opcional)
   - Validación y manejo automático cuando el email asociado no se proporciona
   - Integración con el sistema existente de emails

### Características
1. **Campo Email Principal**
   - Obligatorio para registro y acceso
   - Usado para generación de credenciales
   - Validación de formato de email
2. **Campo Email Asociado**
   - Opcional para notificaciones
   - Si no se proporciona, se usa el email principal
   - Permite separar acceso y notificaciones
   - Facilita la gestión de múltiples contactos

### Beneficios
1. Mayor flexibilidad en la gestión de comunicaciones
2. Separación clara de responsabilidades por email
3. Mejora en la experiencia de usuario con mensajes descriptivos
4. Mantiene compatibilidad con implementación existente

## Corrección del Formulario de Nuevo Negocio
### Problema Resuelto
- **Descripción**: El campo de email asociado no se mostraba correctamente en el formulario de creación de nuevo negocio.
- **Solución**: Reorganización de la estructura del formulario en el componente Negocios.js
- **Cambios Realizados**:
  1. Reordenamiento de campos del formulario
  2. Separación clara de campos obligatorios y opcionales
  3. Mantenimiento de la funcionalidad de edición existente
  4. Mejora en la organización visual de los campos

### Detalles Técnicos
1. **Campos del Formulario**:
   - Nombre del Negocio (requerido)
   - Email Principal (requerido)
   - Email para Notificaciones (opcional)
   - Teléfono (opcional)
   - Usuario y Contraseña (solo en creación)
   - Estado (solo en edición)

2. **Mensajes de Ayuda**:
   - Email Principal: Indica uso para inicio de sesión y gestión
   - Email Asociado: Clarifica su uso para notificaciones

## Corrección en el Manejo de Email Asociado
### Problema Resuelto
- **Descripción**: El campo de email para notificaciones estaba tomando automáticamente el valor del email principal en lugar de mantener su propio valor.
- **Solución**: Corrección en el manejo del estado del formulario y en el procesamiento del backend.

### Cambios Realizados
1. **Frontend (Negocios.js)**
   - Corrección en el manejo del estado del campo email_asociado
   - Separación completa del email principal y email de notificaciones
   - Envío independiente de cada campo al backend

2. **Backend (negociosController.js)**
   - Modificación del procesamiento del email_asociado
   - Permitir valores nulos para email_asociado
   - Manejo independiente de email principal y email de notificaciones

### Comportamiento Actual
1. **Email Principal**
   - Mantiene su valor independiente
   - Requerido para el registro
   - Usado para credenciales de acceso

2. **Email de Notificaciones**
   - Mantiene su propio valor
   - Campo opcional
   - Si no se proporciona, se guarda como null
   - No se auto-rellena con el email principal

### Beneficios
1. Mayor precisión en la gestión de contactos
2. Separación clara de responsabilidades entre emails
3. Prevención de confusiones en las notificaciones
4. Mejor experiencia de usuario en el formulario

## Mejoras en el Manejo de Emails de Negocios

### Cambios Realizados:

1. **Independencia de Emails**
   - Se separó completamente la lógica del email principal y el email de notificaciones
   - El email_asociado ahora se maneja de forma independiente sin depender del email principal
   - Se eliminó la lógica que usaba el email principal como fallback para el email_asociado

2. **Formulario de Negocios**
   - Se actualizó el manejo de cambios en los campos de email
   - Se mantiene el valor del email_asociado independientemente de los cambios en el email principal
   - Se simplificó el objeto de datos enviado al backend
   - Se mejoró la validación y el trimming de los campos

3. **Interfaz de Usuario**
   - Se clarificaron los labels de los campos:
     - "Email Principal" para inicio de sesión
     - "Email para Notificaciones" como campo opcional
   - Se agregaron textos de ayuda (helperText) para mejor claridad

4. **Validaciones**
   - Se mantiene la validación de campos requeridos (nombre y email principal)
   - El email_asociado permanece como campo opcional
   - Se realiza limpieza de espacios en todos los campos antes del envío

Estos cambios mejoran la gestión de emails en el sistema, permitiendo una clara separación entre el email de acceso y el email para notificaciones.

## Corrección de Error en FormulariosController

### Problema
- **Descripción**: Error 500 al intentar acceder a la tabla "formularios" debido a configuración incompleta de la conexión a la base de datos
- **Causa**: Faltaba el parámetro `database` en la configuración del pool de conexión
- **Solución**: Se agregó el parámetro `database: process.env.DB_NAME` en el constructor del FormulariosController

### Impacto
1. Se restauró el acceso correcto a la tabla formularios
2. Se normalizó la configuración del pool con los demás controladores
3. Se evitan errores de conexión en todas las operaciones de formularios

### Buenas Prácticas
- Mantener consistencia en la configuración de conexiones entre controladores
- Verificar todos los parámetros requeridos en las configuraciones de base de datos
- Usar variables de entorno para todos los parámetros de conexión

## Corrección de Error en la Tabla Formularios

### Problema Original
- **Descripción**: Error 500 al acceder a la sección de formularios con mensaje "relation 'formularios' does not exist"
- **Causa**: La tabla formularios existía pero no se podía acceder correctamente
- **Impacto**: No se podían visualizar los formularios en el panel de administración

### Solución Implementada
1. **Verificación de la Estructura**
   - Se confirmó la existencia de la tabla
   - Se validó la estructura y permisos
   - Se ejecutó el script de actualización para asegurar consistencia

2. **Actualizaciones Realizadas**
   - Ejecución del script update_formularios_table.sql
   - Confirmación de índices y relaciones
   - Validación de permisos de acceso

3. **Resultados**
   - Se restauró el acceso a la tabla formularios
   - Se normalizó la visualización en el panel admin
   - Se mantuvieron las relaciones con la tabla negocios

### Prevención Futura
1. **Verificaciones Recomendadas**
   - Validar existencia de tablas antes de operaciones
   - Confirmar permisos de usuario de base de datos
   - Mantener scripts de migración actualizados

2. **Monitoreo**
   - Implementar logs más detallados
   - Verificar regularmente la integridad de la base de datos
   - Mantener documentación de la estructura actualizada

## Corrección de Error en la Tabla Formularios

### Resolución Exitosa
1. **Diagnóstico del Problema**
   - Error 500 al acceder a la sección de formularios
   - Mensaje específico: "relation 'formularios' does not exist"
   - Causa: Problema de acceso a la tabla existente

2. **Solución Aplicada**
   - Ejecución exitosa del script update_formularios_table.sql
   - Verificación de índices y relaciones
   - Confirmación de permisos correctos

3. **Componentes Actualizados**
   - Tabla formularios
   - Índices:
     * idx_formularios_negocio
     * idx_formularios_fecha
     * idx_formularios_atendido
   - Referencias a negocios(id)

4. **Validación de la Solución**
   - Acceso exitoso a la sección de formularios
   - Funcionamiento correcto de las consultas
   - Integridad de datos mantenida

### Mejores Prácticas Identificadas
1. **Mantenimiento de Base de Datos**
   - Verificar scripts de migración antes de ejecutar
   - Mantener respaldos actualizados
   - Documentar cambios en estructura

2. **Gestión de Errores**
   - Implementar mensajes de error descriptivos
   - Mantener logs detallados
   - Establecer procedimientos de verificación

3. **Documentación**
   - Actualizar documentación después de cambios
   - Mantener registro de soluciones aplicadas
   - Documentar procedimientos de verificación

## Corrección en Generación de QR para Nuevos Negocios

### Problema Identificado
- **Descripción**: Los códigos QR no se generaban automáticamente al crear un nuevo negocio
- **Impacto**: Los negocios nuevos no tenían su QR disponible inmediatamente después del registro
- **Ubicación**: negociosController.js, método crear()

### Solución Implementada
1. **Modificaciones en el Controlador**
   - Generación automática del QR después de la inserción del negocio
   - Uso de BASE_URL para la construcción de la URL del formulario
   - Almacenamiento del QR en la base de datos en la misma transacción

2. **Proceso Mejorado**
   - Creación del negocio
   - Generación inmediata del QR
   - Actualización de la tabla con el QR generado
   - Todo dentro de la misma transacción para mantener consistencia

3. **Beneficios**
   - QR disponible inmediatamente después del registro
   - Mayor consistencia en los datos
   - Mejor experiencia para nuevos negocios

### Detalles Técnicos
1. **URL del Formulario**
   - Formato: `${baseUrl}/formulario/${negocioId}`
   - Uso de variables de entorno para la URL base
   - Fallback a URL por defecto si no hay variable de entorno

2. **Almacenamiento**
   - El QR se guarda en formato base64 en la columna codigo_qr
   - Se actualiza en la misma transacción que la creación del negocio

3. **Manejo de Errores**
   - Rollback de la transacción si falla la generación del QR
   - Logs detallados para diagnóstico
   - Mensajes de error específicos

## Implementación de Notificaciones por Email para Formularios

### Funcionalidad Implementada
1. **Notificación Automática**
   - Se envía email al recibir nuevo formulario
   - Se utiliza el email_asociado del negocio como destinatario
   - Incluye todos los datos del formulario recibido
   - Proceso asíncrono que no bloquea la creación del formulario

2. **Contenido del Email**
   - Asunto personalizado con nombre del negocio
   - Datos estructurados del formulario:
     * Nombre del contacto
     * Email del contacto
     * Teléfono
     * Mensaje completo
   - Enlace al panel de administración

3. **Manejo de Errores**
   - Errores en el envío no bloquean el guardado del formulario
   - Registro de errores en logs para monitoreo
   - Respuesta exitosa incluso si falla el envío del email

### Proceso Completo
1. **Recepción del Formulario**
   - Validación de datos
   - Verificación del negocio y su email_asociado
   - Guardado en base de datos

2. **Envío de Notificación**
   - Verificación de email_asociado configurado
   - Preparación del contenido personalizado
   - Envío asíncrono de la notificación
   - Registro de resultado del envío

3. **Seguridad y Privacidad**
   - Uso de variables de entorno para configuración
   - Conexión segura para envío de emails
   - Manejo apropiado de datos sensibles

### Beneficios
1. Notificación inmediata de nuevos contactos
2. Formato estructurado y fácil de leer
3. Proceso robusto que prioriza el guardado de datos
4. Sistema escalable para futuras mejoras

## Actualización en el Sistema de Notificaciones de Formularios

### Cambio Realizado
- **Descripción**: Eliminación del fallback al email principal en notificaciones de formularios
- **Razón**: El email principal no debe recibir datos de formularios de contacto
- **Ubicación**: FormulariosController.js, método crear()

### Comportamiento Actualizado
1. **Notificaciones de Formularios**
   - Solo se envían al email_asociado si está configurado
   - No se usa el email principal como respaldo
   - Si no hay email_asociado, no se envía notificación

2. **Validaciones**
   - Verificación explícita de email_asociado
   - Sin fallback automático
   - Registro claro en logs del estado de envío

3. **Seguridad y Privacidad**
   - Separación clara de responsabilidades entre emails
   - Protección de datos de contacto
   - Respeto a la configuración específica del negocio

### Beneficios
1. Mayor claridad en el flujo de notificaciones
2. Mejor separación de responsabilidades entre emails
3. Respeto a la configuración explícita del negocio
4. Prevención de envío no deseado de datos

## Corrección de Error en el Servicio de Email para Formularios

### Problema Identificado
- **Error**: TypeError al intentar usar emailService.notificarNuevoFormulario
- **Causa**: Incorrecta inicialización y exportación del servicio de email
- **Impacto**: No se enviaban las notificaciones de nuevos formularios

### Solución Implementada
1. **EmailService**
   - Cambio en la exportación del servicio: ahora se exporta la clase en lugar de la instancia
   - Corrección en la estructura de la clase y sus métodos
   - Mejora en el manejo del transporter de nodemailer

2. **FormulariosController**
   - Inicialización del emailService en el constructor
   - Uso correcto de this.emailService para acceder a los métodos
   - Mejor manejo de los logs para debugging

3. **Mejoras en el Sistema**
   - Mejor gestión de las instancias de servicios
   - Logs más detallados para monitoreo
   - Mayor robustez en el manejo de errores

### Impacto de los Cambios
1. **Funcionalidad**
   - Restauración del envío de notificaciones por email
   - Mantenimiento del registro de formularios incluso si falla el email
   - Mejor feedback sobre el estado del envío

2. **Mantenibilidad**
   - Código más limpio y organizado
   - Mejor separación de responsabilidades
   - Facilidad para testing y debugging

3. **Monitoreo**
   - Logs más detallados en cada paso
   - Mejor trazabilidad de errores
   - Información clara sobre éxitos y fallos

## Mejoras en la Visualización y Notificación de Formularios

### Cambios Realizados
1. **Email de Notificación**
   - Eliminación del botón de acceso al panel
   - Inclusión del ID del formulario en el asunto y contenido del email
   - Diseño más limpio y enfocado en la información esencial

2. **Tabla de Formularios**
   - Agregada columna ID al inicio de la tabla
   - ID visible para mejor identificación y seguimiento
   - Campo de búsqueda actualizado para incluir búsqueda por ID

3. **Mejoras en la Identificación**
   - ID único visible en todas las interacciones
   - Referencia numérica clara para cada formulario
   - Mejor trazabilidad de las solicitudes

### Beneficios
1. **Identificación Mejorada**
   - Referencia rápida por ID en comunicaciones
   - Facilidad para localizar formularios específicos
   - Mejor organización del seguimiento

2. **Email más Efectivo**
   - Contenido más directo y relevante
   - Identificación clara del formulario por ID
   - Eliminación de elementos no esenciales

3. **Experiencia de Usuario**
   - Búsqueda más completa incluyendo ID
   - Visualización más clara de la información
   - Mejor capacidad de seguimiento

# Memoria del Proyecto

## Mejoras de Responsividad - [Fecha actual]

Se han implementado mejoras significativas en la responsividad de la aplicación para garantizar una mejor experiencia de usuario en todos los dispositivos:

### Mejoras Globales
- Implementación de estilos base responsivos en index.css
- Optimización del sistema de grid y contenedores
- Ajustes automáticos de tamaños de fuente y espaciado según el dispositivo
- Mejor manejo de tablas en dispositivos móviles

### Layouts
- Mejora en AdminLayout y BusinessLayout para mejor adaptación móvil
- Optimización del drawer lateral para dispositivos móviles
- Ajuste dinámico de la barra de navegación

### Componentes Específicos
- BusinessDashboard: Mejor disposición de tarjetas en móvil
- Códigos: Tabla responsiva con columnas adaptativas
- ValidarCodigo: Optimización para uso móvil del escáner QR

### Beneficios
- Mejor experiencia de usuario en dispositivos móviles y tablets
- Mayor accesibilidad y usabilidad
- Rendimiento optimizado en diferentes dispositivos
- Interfaz más coherente y adaptativa

## Mejoras de Responsividad en el Panel de Administración - [Fecha actual]

Se han implementado mejoras significativas en la responsividad de los componentes del panel de administración para garantizar una experiencia de usuario óptima en dispositivos móviles y tablets:

### Componente Negocios
- Adaptación de tablas para dispositivos móviles con columnas priorizadas
- Implementación de tamaños reducidos para botones e inputs en móvil
- Mejora en la visualización de diálogos de edición y creación
- Optimización del formulario para diferentes tamaños de pantalla
- Manejo mejorado de estados y filtros en versión móvil

### Componente Formularios
- Diseño responsive de la tabla de formularios
- Ocultamiento inteligente de columnas menos importantes en móvil
- Adaptación de botones de acción para mejor usabilidad táctil
- Mejora en la visualización de estados y chips
- Optimización del buscador para diferentes dispositivos

## Configuración de Despliegue en VPS

### Estructura del Despliegue
```plaintext
VPS (145.223.100.119)
├── Frontend: Puerto 80 (nginx)
└── Backend: Puerto 5000 (Node.js/PM2)
```

### Configuración de Nginx
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 145.223.100.119;

    root /var/www/codigosqr/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;  # ¡IMPORTANTE! El backend debe correr en puerto 5000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Headers CORS necesarios
        add_header 'Access-Control-Allow-Origin' 'http://145.223.100.119' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
    }
}
```

### Configuración del Backend
1. **Puerto**: Debe estar configurado en puerto 5000
```javascript
// backend/src/index.js
const PORT = process.env.PORT || 5000;
```

2. **CORS**: Configuración para permitir peticiones desde el dominio principal
```javascript
app.use(cors({
    origin: ['http://145.223.100.119', 'http://145.223.100.119:80'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));
```

### Configuración del Frontend
1. **Variables de Entorno**: Usar `.env.production` para configuración de producción
```env
REACT_APP_API_URL=http://145.223.100.119/api
```

2. **Axios**: Configuración para usar la variable de entorno
```javascript
const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});
```

### Proceso de Despliegue
1. Frontend:
   ```bash
   npm run build
   # Copiar build a /var/www/codigosqr/frontend/build/
   ```

2. Backend:
   ```bash
   pm2 restart codigosqr-api
   ```

3. Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Solución de Problemas Comunes
1. Error de CORS: Verificar configuración en nginx y backend
2. Error de conexión a API: Asegurar que el puerto del backend (5000) coincide con nginx
3. Errores 404: Verificar la configuración de try_files en nginx
4. Problemas de build: Asegurar todas las dependencias instaladas (npm install)

### Componente Facturación
- Implementación de vista responsive para la tabla de facturas
- Adaptación del diálogo de detalles para pantallas pequeñas
- Optimización de filtros de fecha para móvil
- Mejora en la visualización de montos y estados
- Botones y acciones adaptados para interacción táctil

### Beneficios Generales
1. Mejor experiencia de usuario en dispositivos móviles
2. Mayor accesibilidad y usabilidad
3. Rendimiento optimizado en diferentes dispositivos
4. Interfaz más coherente y adaptativa
5. Manejo eficiente del espacio en pantallas pequeñas

### Consideraciones Técnicas
- Uso de useMediaQuery para detección de dispositivos
- Implementación de breakpoints consistentes
- Adaptación dinámica de tamaños de componentes
- Optimización de interacciones táctiles
- Manejo eficiente del espacio en pantalla
