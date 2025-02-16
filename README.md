# Sistema de Códigos de Descuento

Sistema web para la gestión de códigos de descuento con panel de administración, panel de negocios, sistema de facturación y generación de códigos QR.

## 🚀 Características

- Panel de Administración General
- Panel de Negocios Asociados
- Sistema de Códigos QR
- Gestión de Códigos de Descuento
- Sistema de Facturación Integrado
- Sistema de Notificaciones por Email
- Formularios de Captura de Datos

## 🛠️ Tecnologías

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT para autenticación
- Nodemailer para emails
- QRCode para generación de códigos QR

### Frontend
- React.js
- TailwindCSS
- Axios
- React Router DOM

## 📋 Prerrequisitos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn
- Cuenta de correo para envío de notificaciones

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/sistema-descuentos.git
cd sistema-descuentos
```

2. **Configurar el Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configurar las variables de entorno en el archivo .env
```

3. **Configurar la Base de Datos**
```bash
# Ejecutar los scripts SQL en backend/src/database/schema.sql
```

4. **Configurar el Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Configurar las variables de entorno en el archivo .env
```

## ⚙️ Variables de Entorno

### Backend (.env)
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_descuentos
JWT_SECRET=tu_secreto_jwt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Ejecutar el Proyecto

1. **Iniciar el Backend**
```bash
cd backend
npm run dev
```

2. **Iniciar el Frontend**
```bash
cd frontend
npm start
```

## 📦 Estructura del Proyecto

```
sistema-descuentos/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── database/
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    ├── .env
    └── package.json
```

## 🔐 Roles y Permisos

### Administrador General
- Gestión completa de negocios
- Generación de códigos de descuento
- Visualización de estadísticas
- Acceso a todos los datos de formularios

### Negocios
- Validación de códigos de descuento
- Acceso a su código QR único
- Visualización de sus estadísticas

## 📱 Funcionalidades Principales

1. **Gestión de Negocios**
   - Alta, baja y modificación de negocios
   - Asignación de credenciales

2. **Códigos de Descuento**
   - Generación de códigos únicos
   - Validación mediante QR
   - Sistema de canje

3. **Sistema QR**
   - QR para códigos de descuento
   - QR único por negocio
   - Formularios de captura

4. **Facturación**
   - Generación de facturas automática
   - Historial de facturación por negocio
   - Reportes de facturación

5. **Notificaciones**
   - Envío automático de credenciales
   - Notificación de códigos de descuento
   - Alertas de sistema

## 👥 Contribución

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 📧 Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter) - email@ejemplo.com

Link del Proyecto: [https://github.com/tu-usuario/sistema-descuentos](https://github.com/tu-usuario/sistema-descuentos)