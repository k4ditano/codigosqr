#!/bin/bash

# Variables de entorno desde .env
DB_USER="postgres"
DB_PASSWORD="anabelNa789--"
DB_NAME="sistema_descuentos"

# Función para ejecutar comandos SQL
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -c "$1"
}

# Crear la base de datos
echo "Creando base de datos..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Crear las tablas
echo "Creando tablas..."
execute_sql "CREATE TABLE negocios (
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
);"

execute_sql "CREATE TABLE descuentos (
    id SERIAL PRIMARY KEY,
    negocio_id INTEGER REFERENCES negocios(id),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    porcentaje INTEGER NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

execute_sql "CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

execute_sql "CREATE TABLE redenciones (
    id SERIAL PRIMARY KEY,
    descuento_id INTEGER REFERENCES descuentos(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_redencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT true
);"

# Crear índices para mejorar el rendimiento
echo "Creando índices..."
execute_sql "CREATE INDEX idx_negocios_email ON negocios(email);"
execute_sql "CREATE INDEX idx_descuentos_negocio ON descuentos(negocio_id);"
execute_sql "CREATE INDEX idx_redenciones_descuento ON redenciones(descuento_id);"
execute_sql "CREATE INDEX idx_redenciones_usuario ON redenciones(usuario_id);"

echo "Base de datos creada exitosamente!" 