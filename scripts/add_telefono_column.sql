-- Añadir columna telefono a la tabla negocios si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'negocios' AND column_name = 'telefono'
    ) THEN
        ALTER TABLE negocios ADD COLUMN telefono VARCHAR(20);
    END IF;
END $$; 