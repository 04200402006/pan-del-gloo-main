import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-bakery-dark/60 via-bakery-dark/40 to-bakery-dark/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <span className="text-bakery-gold font-medium tracking-[0.3em] uppercase text-sm mb-4 animate-fade-in">
          Tradición & Sabor
        </span>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary-foreground font-semibold mb-6 animate-fade-in">
          Pan Suave y Artesanal
          <br />
          <span className="text-bakery-gold">Dale gusto a tu paladar.</span>
        </h2>
        <Button
          onClick={scrollToCatalog}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-full animate-fade-in"
        >
          Ver Catálogo
          <ChevronDown className="ml-2 h-5 w-5 animate-bounce-subtle" />
        </Button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
