import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/product";

export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalPrice: number;
}

export async function createOrder(payload: OrderPayload): Promise<string> {
  // 1. Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      total_price: payload.totalPrice,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) throw orderError ?? new Error("Error al crear pedido");

  // 2. Insert items
  const orderItems = payload.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw itemsError;

  return order.id;
}

// ─── Admin hooks ────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  status: "pending" | "validated" | "rejected";
  notes: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    price: number;
    quantity: number;
  }[];
}

export function useOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      notes,
    }: {
      orderId: string;
      status: "validated" | "rejected";
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, notes: notes ?? null })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
}

