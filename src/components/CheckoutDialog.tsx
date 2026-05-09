import { useState } from "react";
import { useCartContext } from "@/contexts/CartContext";
import { createOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || "522871104102";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const { items, totalPrice, clearCart, closeCart } = useCartContext();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createOrder({
        customerName: name,
        customerPhone: phone,
        items,
        totalPrice,
      });
    } catch {
      toast.error("No se pudo registrar el pedido, pero se enviará por WhatsApp.");
    }

    // Construir mensaje de WhatsApp
    let message = "🥖 *Nuevo Pedido - Panadería Suave*\n\n";
    message += `👤 *${name}*\n`;
    message += `📱 ${phone}\n\n`;
    message += "📋 *Detalle del pedido:*\n";
    message += "─────────────────\n";
    items.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += "─────────────────\n";
    message += `💰 *Total: $${totalPrice.toFixed(2)} MXN*\n\n`;
    message += "¡Hola quiero hacer un pedido! 🙏";

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    clearCart();
    closeCart();
    onClose();
    setName("");
    setPhone("");
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Confirmar pedido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resumen del pedido */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-1 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-foreground">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">${totalPrice.toFixed(2)} MXN</span>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="checkout-name">Tu nombre</Label>
              <Input
                id="checkout-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. María García"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkout-phone">Tu número de WhatsApp</Label>
              <Input
                id="checkout-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 2871234567"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "Enviar pedido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
