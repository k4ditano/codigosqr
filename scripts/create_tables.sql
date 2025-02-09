CREATE TABLE IF NOT EXISTS codigos (
    id SERIAL PRIMARY KEY,
    negocio_id INTEGER REFERENCES negocios(id),
    codigo VARCHAR(10) NOT NULL UNIQUE,
    porcentaje INTEGER DEFAULT 10,
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    codigo_qr TEXT,
    email VARCHAR(255),
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS formularios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    atendido BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    negocio_id INTEGER REFERENCES negocios(id),
    monto_descuento DECIMAL(10,2) DEFAULT 25.00,
    monto_ingreso DECIMAL(10,2) DEFAULT 25.00,
    monto_total DECIMAL(10,2) DEFAULT 50.00,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, aceptada, pagada
    canje_id INTEGER REFERENCES canjes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS canjes (
    id SERIAL PRIMARY KEY,
    codigo_id INTEGER REFERENCES codigos(id),
    negocio_id INTEGER REFERENCES negocios(id),
    metodo_canje VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS negocios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    usuario VARCHAR(50) NOT NULL,  
    password VARCHAR(100) NOT NULL,  -- Este campo también es requerido
    codigo_qr TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'business'
);

-- Asegurarnos de que la tabla usuarios existe y está correctamente configurada
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'business',
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(100)
); 