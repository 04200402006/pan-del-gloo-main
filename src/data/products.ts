import { Product, Category } from "@/types/product";
import imgDefault from "@/assets/payaso.png";

export const categories: Category[] = [
  { id: "all",              name: "Todos",            slug: "all",              visible: true, display_order: 0 },
  { id: "pan-dulce",        name: "Pan Dulce",        slug: "pan-dulce",        visible: true, display_order: 1 },
  { id: "pan-salado",       name: "Pan Salado",       slug: "pan-salado",       visible: true, display_order: 2 },
  { id: "danes",            name: "Danés",            slug: "danes",            visible: true, display_order: 3 },
  { id: "pan-de-manteca",   name: "Pan de Manteca",   slug: "pan-de-manteca",   visible: true, display_order: 4 },
  { id: "hojaldre",         name: "Hojaldre",         slug: "hojaldre",         visible: true, display_order: 5 },
  { id: "bolsitas-surtidas",name: "Bolsitas Surtidas",slug: "bolsitas-surtidas",visible: true, display_order: 6 },
  { id: "galletas",         name: "Galletas",         slug: "galletas",         visible: true, display_order: 7 },
];

export const products: Product[] = [
  { id: "f1", name: "Concha",   description: "", price: 0, image: imgDefault, category: "pan-dulce" },
  { id: "f2", name: "Bolillo",  description: "", price: 0, image: imgDefault, category: "pan-salado" },
  { id: "f3", name: "Cuerno",   description: "", price: 0, image: imgDefault, category: "danes" },
  { id: "f4", name: "Empanada", description: "", price: 0, image: imgDefault, category: "pan-de-manteca" },
  { id: "f5", name: "Orejas",   description: "", price: 0, image: imgDefault, category: "hojaldre" },
  { id: "f6", name: "Purito",   description: "", price: 0, image: imgDefault, category: "bolsitas-surtidas" },
];
