import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { categories as staticCategories, products as staticProducts } from "@/data/products";
import imgDefault from "@/assets/payaso.png";
import imgPayaso from "@/assets/payaso.png";
import imgTacon from "@/assets/tacon.png";
import imgGusano from "@/assets/gusano.png";
import imgTaco from "@/assets/taco.png";
import imgPierna from "@/assets/pierna.png";
import imgTortaDeQueso from "@/assets/torta de queso.png";
import imgBarra from "@/assets/barra.png";
import imgBolillo from "@/assets/bolillo.png";
import imgNovia from "@/assets/novia.png";
import imgTrenza from "@/assets/trenza.png";
import imgTrenzaDeManteca from "@/assets/trenza de manteca.png";
import imgChamuco from "@/assets/chamuco.png";
import imgLlanta from "@/assets/llanta.png";
import imgPuro from "@/assets/puro.png";
import imgCocol from "@/assets/cocol.png";
import imgBroca from "@/assets/broca.png";
import imgCola from "@/assets/cola.png";
import imgHoja from "@/assets/hoja.png";
import imgRoles from "@/assets/roles.png";
import imgBigote from "@/assets/bigote.png";
import imgTriangulo from "@/assets/triangulo.png";
import imgGalleta from "@/assets/galleta.png";
import imgGalletaConGrajea from "@/assets/galleta con grajea.png";
import imgBanderrilla from "@/assets/banderrilla.jpg";
import imgBisque from "@/assets/bisque.jpg";
import imgCanilla from "@/assets/canilla.png";
import imgConcha from "@/assets/concha.jpeg";
import imgCuerno from "@/assets/cuerno.jpg";
import imgEmpanada from "@/assets/empanada.jpeg";
import imgEngrane from "@/assets/engrane.png";
import imgLlantaDeManteca from "@/assets/llanta de manteca.png";
import imgMantecada from "@/assets/mantecada.jpg";
import imgMono from "@/assets/moño.jpg";
import imgOreja from "@/assets/oreja.png";
import imgTornillo from "@/assets/tornillo.png";
import imgTroncoDeManteca from "@/assets/tronco de manteca.png";
import imgTronco from "@/assets/tronco.png";
import imgVolovanes from "@/assets/volovanes.jpeg";

const LOCAL_IMAGES: Record<string, string> = {
  "payaso":             imgPayaso,
  "tacon":              imgTacon,
  "gusano":             imgGusano,
  "taco":               imgTaco,
  "pierna":             imgPierna,
  "torta de queso":     imgTortaDeQueso,
  "barra":              imgBarra,
  "bolillo":            imgBolillo,
  "novia":              imgNovia,
  "trenza danesa":      imgTrenza,
  "trenza de manteca":  imgTrenzaDeManteca,
  "chamuco":            imgChamuco,
  "llanta":             imgLlanta,
  "puro":               imgPuro,
  "cocol":              imgCocol,
  "broca":              imgBroca,
  "cola":               imgCola,
  "hoja":               imgHoja,
  "roles":              imgRoles,
  "bigote":             imgBigote,
  "triangulo":          imgTriangulo,
  "galleta":            imgGalleta,
  "galleta con grajea": imgGalletaConGrajea,
  "banderrilla":        imgBanderrilla,
  "bisque":             imgBisque,
  "canilla":            imgCanilla,
  "concha":             imgConcha,
  "cuerno":             imgCuerno,
  "empanada":           imgEmpanada,
  "engrane":            imgEngrane,
  "llanta de manteca":  imgLlantaDeManteca,
  "mantecada":          imgMantecada,
  "mono":               imgMono,
  "oreja":              imgOreja,
  "tornillo":           imgTornillo,
  "tronco de manteca":  imgTroncoDeManteca,
  "tronco":             imgTronco,
  "volovanes":          imgVolovanes,
};

function normalizeKey(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export interface CategoryDB {
  id: string;
  name: string;
  slug: string;
  visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DBProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  category_id: string | null;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductWithAvailability = Product & { available: boolean };

export function dbProductToProduct(p: DBProduct): ProductWithAvailability {
  let image: string = LOCAL_IMAGES[normalizeKey(p.name)] ?? imgDefault;
  if (p.image_url) {
    if (p.image_url.startsWith("http")) {
      image = p.image_url;
    } else if (LOCAL_IMAGES[p.image_url]) {
      image = LOCAL_IMAGES[p.image_url];
    }
  }
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    price: Number(p.price),
    image,
    category: p.category,
    category_id: p.category_id,
    available: p.available,
  };
}

// ─── Públicos ─────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery<CategoryDB[]>({
    queryKey: ["categories"],
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      if (error) {
        console.warn("Supabase no disponible, usando categorías estáticas:", error.message);
        return staticCategories
          .filter((c) => c.id !== "all")
          .map((c) => ({ ...c, created_at: "", updated_at: "" })) as CategoryDB[];
      }
      return data as CategoryDB[];
    },
  });
}

export function useProducts() {
  return useQuery<ProductWithAvailability[]>({
    queryKey: ["products"],
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("available", true)
        .order("name");

      if (error) {
        console.warn("Supabase no disponible, usando catálogo estático:", error.message);
        return staticProducts.map((p) => ({ ...p, available: true }));
      }

      return (data as DBProduct[]).map(dbProductToProduct);
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminProducts() {
  return useQuery<DBProduct[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as DBProduct[];
    },
  });
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      const { error } = await supabase.from("categories").insert({ name, slug });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      visible,
    }: {
      id: string;
      name: string;
      visible: boolean;
    }) => {
      const { error } = await supabase
        .from("categories")
        .update({ name, visible })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error: prodError } = await supabase
        .from("products")
        .delete()
        .eq("category_id", id);
      if (prodError) throw prodError;

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Product CRUD ─────────────────────────────────────────────────────────────

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string;
      price: number;
      image_url: string;
      available: boolean;
      category: string;
      category_id: string;
    }) => {
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      name: string;
      description: string;
      price: number;
      image_url: string;
      available: boolean;
    }) => {
      const { id, ...rest } = payload;
      const { error } = await supabase.from("products").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      available,
    }: {
      productId: string;
      available: boolean;
    }) => {
      const { error } = await supabase
        .from("products")
        .update({ available })
        .eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
