-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  visible      BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer categorías"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins pueden gestionar categorías"
  ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- Hacer product_id nullable en order_items para soportar eliminación de productos
ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

-- Eliminar columna seasonal de productos
ALTER TABLE public.products DROP COLUMN IF EXISTS seasonal;

-- Agregar FK de categorías en productos
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Limpiar datos existentes para sembrar catálogo nuevo
DELETE FROM public.order_items;
DELETE FROM public.products;

-- Sembrar categorías
INSERT INTO public.categories (name, slug, display_order) VALUES
  ('Pan Dulce',         'pan-dulce',         1),
  ('Pan Salado',        'pan-salado',        2),
  ('Danés',             'danes',             3),
  ('Pan de Manteca',    'pan-de-manteca',    4),
  ('Hojaldre',          'hojaldre',          5),
  ('Bolsitas Surtidas', 'bolsitas-surtidas', 6);

-- ── Pan Dulce ─────────────────────────────────────────────────────────────────
DO $$
DECLARE v_cat UUID;
BEGIN
  SELECT id INTO v_cat FROM public.categories WHERE slug = 'pan-dulce';
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Concha',         '', 0, 'pan-dulce', v_cat, true),
    ('Payaso',         '', 0, 'pan-dulce', v_cat, true),
    ('Colchón',        '', 0, 'pan-dulce', v_cat, true),
    ('Teléfono',       '', 0, 'pan-dulce', v_cat, true),
    ('Tacón',          '', 0, 'pan-dulce', v_cat, true),
    ('Huiro',          '', 0, 'pan-dulce', v_cat, true),
    ('Taco',           '', 0, 'pan-dulce', v_cat, true),
    ('Gusano',         '', 0, 'pan-dulce', v_cat, true),
    ('Pierna',         '', 0, 'pan-dulce', v_cat, true),
    ('Canilla',        '', 0, 'pan-dulce', v_cat, true),
    ('Estropajo',      '', 0, 'pan-dulce', v_cat, true),
    ('Chicharrón',     '', 0, 'pan-dulce', v_cat, true),
    ('Tornillo',       '', 0, 'pan-dulce', v_cat, true),
    ('Bucle',          '', 0, 'pan-dulce', v_cat, true),
    ('Torta de queso', '', 0, 'pan-dulce', v_cat, true),
    ('Barra',          '', 0, 'pan-dulce', v_cat, true);
END $$;

-- ── Pan Salado ────────────────────────────────────────────────────────────────
DO $$
DECLARE v_cat UUID;
BEGIN
  SELECT id INTO v_cat FROM public.categories WHERE slug = 'pan-salado';
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Cema',   '', 0, 'pan-salado', v_cat, true),
    ('Bolillo', '', 0, 'pan-salado', v_cat, true);
END $$;

-- ── Danés ─────────────────────────────────────────────────────────────────────
DO $$
DECLARE v_cat UUID;
BEGIN
  SELECT id INTO v_cat FROM public.categories WHERE slug = 'danes';
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Cuerno',        '', 0, 'danes', v_cat, true),
    ('Bisquet',       '', 0, 'danes', v_cat, true),
    ('Trenza danesa', '', 0, 'danes', v_cat, true),
    ('Moño',          '', 0, 'danes', v_cat, true),
    ('Novia',         '', 0, 'danes', v_cat, true);
END $$;

-- ── Pan de Manteca ────────────────────────────────────────────────────────────
DO $$
DECLARE v_cat UUID;
BEGIN
  SELECT id INTO v_cat FROM public.categories WHERE slug = 'pan-de-manteca';
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Empanada',          '', 0, 'pan-de-manteca', v_cat, true),
    ('Trenza de manteca', '', 0, 'pan-de-manteca', v_cat, true),
    ('Chamuco',           '', 0, 'pan-de-manteca', v_cat, true),
    ('Llanta',            '', 0, 'pan-de-manteca', v_cat, true),
    ('Engrane',           '', 0, 'pan-de-manteca', v_cat, true),
    ('Puro',              '', 0, 'pan-de-manteca', v_cat, true),
    ('Cocol',             '', 0, 'pan-de-manteca', v_cat, true),
    ('Mantecada',         '', 0, 'pan-de-manteca', v_cat, true);
END $$;

-- ── Hojaldre ──────────────────────────────────────────────────────────────────
DO $$
DECLARE v_cat UUID;
BEGIN
  SELECT id INTO v_cat FROM public.categories WHERE slug = 'hojaldre';
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Volovanes',  '', 0, 'hojaldre', v_cat, true),
    ('Broca',      '', 0, 'hojaldre', v_cat, true),
    ('Orejas',     '', 0, 'hojaldre', v_cat, true),
    ('Banderilla', '', 0, 'hojaldre', v_cat, true);
END $$;

-- ── Bolsitas Surtidas ─────────────────────────────────────────────────────────
DO $$
DECLARE v_cat UUID;
BEGIN
  SELECT id INTO v_cat FROM public.categories WHERE slug = 'bolsitas-surtidas';
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Purito',        '', 0, 'bolsitas-surtidas', v_cat, true),
    ('Chamuquito',    '', 0, 'bolsitas-surtidas', v_cat, true),
    ('Pan surtidito', '', 0, 'bolsitas-surtidas', v_cat, true);
END $$;
