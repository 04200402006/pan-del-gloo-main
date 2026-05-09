import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { totalItems, toggleCart } = useCartContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-primary tracking-wide">
              Panadería
              <span className="text-bakery-gold ml-1">Suave</span>
            </h1>
            <img src="/logo.png" alt="Logo Panadería Suave" className="h-10 md:h-12 w-auto object-contain" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 ml-auto mr-4">
            <button
              onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Nosotros
            </button>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={toggleCart}
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="h-6 w-6 text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-16 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-3">
            <button
              className="text-foreground/80 hover:text-primary transition-colors font-medium py-2 text-left"
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Nosotros
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
