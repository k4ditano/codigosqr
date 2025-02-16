#!/bin/bash

# Verificar la configuración de email
echo "Verificando configuración de email..."

# Comprobar variables de entorno necesarias
REQUIRED_VARS=("EMAIL_HOST" "EMAIL_PORT" "EMAIL_USER" "EMAIL_PASS" "EMAIL_SECURE")
MISSING_VARS=0

for VAR in "${REQUIRED_VARS[@]}"
do
    if [ -z "${!VAR}" ]; then
        echo "❌ Variable $VAR no está configurada"
        MISSING_VARS=1
    else
        echo "✅ Variable $VAR está configurada"
    fi
done

if [ $MISSING_VARS -eq 1 ]; then
    echo "
⚠️  Algunas variables de entorno necesarias no están configuradas.
Por favor, asegúrate de tener las siguientes variables en tu archivo .env:

EMAIL_HOST=smtp.tuservidor.com
EMAIL_PORT=587
EMAIL_USER=tu@email.com
EMAIL_PASS=tupassword
EMAIL_SECURE=true/false
"
    exit 1
fi

# Verificar conexión SMTP
echo "
Intentando conectar al servidor SMTP..."
NC_TIMEOUT=5
if nc -zw$NC_TIMEOUT $EMAIL_HOST $EMAIL_PORT 2>/dev/null; then
    echo "✅ Conexión al servidor SMTP exitosa"
else
    echo "❌ No se pudo conectar al servidor SMTP"
    echo "Por favor verifica que el host y puerto sean correctos y que el servidor esté accesible"
    exit 1
fi

echo "
📧 Configuración de email verificada correctamente"
