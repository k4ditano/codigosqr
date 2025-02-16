-- Añadir columna email_asociado a la tabla negocios
ALTER TABLE negocios
ADD COLUMN email_asociado VARCHAR(100);

-- Inicialmente, copiar el valor del email actual al email_asociado
UPDATE negocios
SET email_asociado = email;

-- Crear índice para mejorar el rendimiento de búsquedas por email_asociado
CREATE INDEX idx_negocios_email_asociado ON negocios(email_asociado);