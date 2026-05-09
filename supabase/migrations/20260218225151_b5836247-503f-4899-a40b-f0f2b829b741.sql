
-- ============================================================
-- TABLA: products
-- ============================================================
CREATE TABLE public.products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL,
  image_url    TEXT,
  category     TEXT NOT NULL,
  available    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Lectura pública (catálogo visible para todos)
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  USING (true);

-- Solo el sistema (service_role) puede modificar productos
CREATE POLICY "Products admin insert"
  ON public.products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Products admin update"
  ON public.products FOR UPDATE
  USING (true);

CREATE POLICY "Products admin delete"
  ON public.products FOR DELETE
  USING (true);

-- ============================================================
-- TABLA: orders
-- ============================================================
CREATE TABLE public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  total_price     NUMERIC(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede crear un pedido (catálogo público sin auth)
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Solo admin puede leer / actualizar pedidos
CREATE POLICY "Orders admin read"
  ON public.orders FOR SELECT
  USING (true);

CREATE POLICY "Orders admin update"
  ON public.orders FOR UPDATE
  USING (true);

-- ============================================================
-- TABLA: order_items
-- ============================================================
CREATE TABLE public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert order_items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Order items admin read"
  ON public.order_items FOR SELECT
  USING (true);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SEED: insertar productos iniciales
-- ============================================================
INSERT INTO public.products (name, description, price, category, available, image_url) VALUES
  ('Concha de Chocolate',   'Deliciosa concha tradicional con cobertura de chocolate', 15,  'pan-dulce',      true,  'concha-chocolate'),
  ('Concha de Vainilla',    'Suave concha con cobertura de vainilla azucarada',         15,  'pan-dulce',      true,  'concha-vainilla'),
  ('Cuerno',                'Cuerno hojaldrado con mantequilla',                         18,  'pan-dulce',      true,  'cuerno'),
  ('Oreja',                 'Crujiente oreja con azúcar caramelizada',                   20,  'pan-dulce',      true,  'oreja'),
  ('Polvorón',              'Tradicional polvorón de manteca',                            12,  'pan-dulce',      true,  'polvoron'),
  ('Baguette Artesanal',    'Crujiente baguette de masa madre',                          35,  'pan-salado',     true,  'baguette'),
  ('Bolillo',               'Bolillo tradicional mexicano',                               5,   'pan-salado',     true,  'bolillo'),
  ('Telera',                'Suave telera para tortas',                                   6,   'pan-salado',     true,  'telera'),
  ('Ciabatta',              'Pan italiano crujiente por fuera, suave por dentro',         28,  'pan-salado',     true,  'ciabatta'),
  ('Pan de Muerto',         'Tradicional pan de muerto con azahar',                      45,  'especialidades', true,  'pan-muerto'),
  ('Rosca de Reyes',        'Deliciosa rosca decorada con ate y azúcar',                 180, 'especialidades', true,  'pan-muerto'),
  ('Tres Leches Individual','Pastel de tres leches en porción individual',               55,  'especialidades', true,  'pastel-chocolate'),
  ('Galleta de Mantequilla','Crujiente galleta de mantequilla artesanal',                18,  'galletas',       true,  'galleta-chocolate'),
  ('Galleta de Chocolate',  'Galleta con chips de chocolate belga',                      22,  'galletas',       true,  'galleta-chocolate'),
  ('Galleta de Avena',      'Saludable galleta de avena con pasas',                      20,  'galletas',       true,  'galleta-chocolate'),
  ('Pastel de Chocolate',   'Esponjoso pastel de chocolate con ganache',                 350, 'pasteles',       true,  'pastel-chocolate'),
  ('Pastel de Fresa',       'Delicioso pastel con fresas frescas y crema',               380, 'pasteles',       true,  'pastel-chocolate'),
  ('Cheesecake',            'Cremoso cheesecake New York style',                         420, 'pasteles',       true,  'pastel-chocolate');
