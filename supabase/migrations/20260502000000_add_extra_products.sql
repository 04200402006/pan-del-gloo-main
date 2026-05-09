-- Nueva categoría Galletas
INSERT INTO public.categories (name, slug, display_order) VALUES
  ('Galletas', 'galletas', 7);

-- Insertar los 7 productos extra en sus categorías
DO $$
DECLARE v_pan_dulce       UUID;
DECLARE v_pan_de_manteca  UUID;
DECLARE v_danes           UUID;
DECLARE v_galletas        UUID;
BEGIN
  SELECT id INTO v_pan_dulce      FROM public.categories WHERE slug = 'pan-dulce';
  SELECT id INTO v_pan_de_manteca FROM public.categories WHERE slug = 'pan-de-manteca';
  SELECT id INTO v_danes          FROM public.categories WHERE slug = 'danes';
  SELECT id INTO v_galletas       FROM public.categories WHERE slug = 'galletas';

  -- Pan Dulce
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Triángulo', '', 0, 'pan-dulce', v_pan_dulce, true);

  -- Pan de Manteca
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Cola', '', 0, 'pan-de-manteca', v_pan_de_manteca, true),
    ('Hoja', '', 0, 'pan-de-manteca', v_pan_de_manteca, true);

  -- Danés
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Roles',   '', 0, 'danes', v_danes, true),
    ('Bigote',  '', 0, 'danes', v_danes, true);

  -- Galletas
  INSERT INTO public.products (name, description, price, category, category_id, available) VALUES
    ('Galleta',            '', 0, 'galletas', v_galletas, true),
    ('Galleta con grajea', '', 0, 'galletas', v_galletas, true);
END $$;
