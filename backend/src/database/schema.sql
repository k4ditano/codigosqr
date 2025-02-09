-- Crear la base de datos si no existe
CREATE DATABASE sistema_descuentos;

-- Conectar a la base de datos
\c sistema_descuentos;

-- Eliminar tablas existentes en orden inverso (por las dependencias)
DROP TABLE IF EXISTS pagos_codigos CASCADE;
DROP TABLE IF EXISTS facturacion CASCADE;
DROP TABLE IF EXISTS formulario_clientes CASCADE;
DROP TABLE IF EXISTS canjes CASCADE;
DROP TABLE IF EXISTS codigos_descuento CASCADE;
DROP TABLE IF EXISTS negocios CASCADE;

-- Tabla de negocios
CREATE TABLE negocios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    codigo_qr TEXT,
    estado BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'business',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de códigos de descuento
CREATE TABLE codigos_descuento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    cliente_email VARCHAR(100) NOT NULL,
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    negocio_id INTEGER REFERENCES negocios(id),
    qr_code TEXT
);

-- Tabla de canjes
CREATE TABLE canjes (
    id SERIAL PRIMARY KEY,
    codigo_descuento_id INTEGER REFERENCES codigos_descuento(id),
    negocio_id INTEGER REFERENCES negocios(id),
    fecha_canje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_canje VARCHAR(20) NOT NULL
);

-- Tabla de formularios de clientes
CREATE TABLE formulario_clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    negocio_id INTEGER REFERENCES negocios(id),
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de facturación
CREATE TABLE facturacion (
    id SERIAL PRIMARY KEY,
    negocio_id INTEGER REFERENCES negocios(id),
    mes INTEGER NOT NULL,
    año INTEGER NOT NULL,
    total_codigos INTEGER NOT NULL DEFAULT 0,
    monto_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha_pago TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(negocio_id, mes, año)
);

-- Tabla de pagos por código
CREATE TABLE pagos_codigos (
    id SERIAL PRIMARY KEY,
    canje_id INTEGER REFERENCES canjes(id),
    negocio_id INTEGER REFERENCES negocios(id),
    monto DECIMAL(10,2) NOT NULL,
    facturacion_id INTEGER REFERENCES facturacion(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 