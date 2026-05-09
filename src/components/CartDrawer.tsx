import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { useCartContext } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckoutDialog } from "./CheckoutDialog";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartContext();

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={closeCart}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle className="font-display text-2xl flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Tu Carrito
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground text-sm font-bold rounded-full h-6 px-2 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-muted-foreground mb-6">
                Agrega algunos deliciosos productos para comenzar
              </p>
              <Button onClick={closeCart} variant="outline">
                Continuar comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-secondary/50 rounded-lg animate-fade-in"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-bakery-cream flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-foreground line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-primary font-bold">
                        ${item.price.toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Reducir cantidad de ${item.name}`}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold" aria-live="polite">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Aumentar cantidad de ${item.name}`}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label={`Eliminar ${item.name} del carrito`}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-semibold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Footer */}
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-foreground">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalPrice.toFixed(2)} MXN
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Pedir por WhatsApp
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={clearCart}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vaciar carrito
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
