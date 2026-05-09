-- Columna seasonal en productos
ALTER TABLE products ADD COLUMN IF NOT EXISTS seasonal BOOLEAN NOT NULL DEFAULT false;

-- Tabla de configuración del sitio (secciones activables)
CREATE TABLE IF NOT EXISTS site_settings (
  key     TEXT PRIMARY KEY,
  label   TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sección "De Temporada" desactivada por defecto
INSERT INTO site_settings (key, label, enabled)
VALUES ('temporada', 'De Temporada', false)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer (la página del cliente necesita saber si la sección está activa)
CREATE POLICY "site_settings public read" ON site_settings
  FOR SELECT USING (true);

-- Solo usuarios autenticados (admin) pueden modificar
CREATE POLICY "site_settings admin update" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');
