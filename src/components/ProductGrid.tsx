import { useState, useMemo } from "react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { CategoryFilter } from "./CategoryFilter";

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const visibleCategories = useMemo(
    () => (categories ?? []).filter((c) => c.visible),
    [categories]
  );

  const visibleSlugs = useMemo(
    () => new Set(visibleCategories.map((c) => c.slug)),
    [visibleCategories]
  );

  const availableProducts = useMemo(
    () => (products ?? []).filter((p) => p.available && visibleSlugs.has(p.category)),
    [products, visibleSlugs]
  );

  const filteredProducts =
    selectedCategory === "all"
      ? availableProducts
      : availableProducts.filter((p) => p.category === selectedCategory);

  const isLoading = productsLoading || categoriesLoading;

  return (
    <section id="catalogo" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-bakery-gold font-medium tracking-widest uppercase text-sm">
            Nuestra Selección
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mt-2">
            Catálogo de Productos
          </h2>
        </div>

        <CategoryFilter
          categories={visibleCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No hay productos disponibles en esta categoría.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
