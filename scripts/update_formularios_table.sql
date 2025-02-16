-- Agregar columna negocio_id si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'formularios' AND column_name = 'negocio_id'
    ) THEN
        ALTER TABLE formularios ADD COLUMN negocio_id INTEGER REFERENCES negocios(id);
    END IF;
END $$;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_formularios_negocio ON formularios(negocio_id);
CREATE INDEX IF NOT EXISTS idx_formularios_fecha ON formularios(created_at);
CREATE INDEX IF NOT EXISTS idx_formularios_atendido ON formularios(atendido);