import { Plus, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCartContext } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);

  const itemInCart = items.find((item) => item.id === product.id);
  const quantityInCart = itemInCart?.quantity || 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-bakery-cream">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={400}
          height={400}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Quantity Badge */}
        {quantityInCart > 0 && (
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center shadow-lg">
            {quantityInCart}
          </div>
        )}

        {/* Quick Add Button — decorativo, el botón visible "Agregar" cubre la acción */}
        <Button
          onClick={handleAddToCart}
          size="icon"
          aria-hidden="true"
          tabIndex={-1}
          className={cn(
            "absolute bottom-3 right-3 rounded-full shadow-lg transition-all duration-300",
            "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
            isAdding
              ? "bg-green-600 hover:bg-green-600"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isAdding ? (
            <Check className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Plus className="h-5 w-5 text-primary-foreground" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ${product.price.toFixed(2)}
          </span>
          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}
