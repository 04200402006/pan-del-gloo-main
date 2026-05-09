-- Pan Salado: $3
UPDATE public.products SET price = 3 WHERE category = 'pan-salado';

-- Pan Dulce: $6
UPDATE public.products SET price = 6 WHERE category = 'pan-dulce';

-- Danés: $6
UPDATE public.products SET price = 6 WHERE category = 'danes';

-- Pan de Manteca: $6
UPDATE public.products SET price = 6 WHERE category = 'pan-de-manteca';

-- Hojaldre: $10 (excepto Volovanes)
UPDATE public.products SET price = 10 WHERE category = 'hojaldre';
UPDATE public.products SET price = 20 WHERE category = 'hojaldre' AND name = 'Volovanes';

-- Bolsitas Surtidas: $30
UPDATE public.products SET price = 30 WHERE category = 'bolsitas-surtidas';

-- Galletas: $6
UPDATE public.products SET price = 6 WHERE category = 'galletas';
