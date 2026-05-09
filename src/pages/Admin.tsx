import { useState, useMemo } from "react";
import { useOrders, useUpdateOrderStatus, Order } from "@/hooks/useOrders";
import {
  useCategories,
  useAdminProducts,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateProductAvailability,
  CategoryDB,
  DBProduct,
} from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  X,
  RefreshCw,
  ShoppingBag,
  Package,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendiente",
  validated: "Validado",
  rejected: "Rechazado",
};

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  validated: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Tipos de diálogo ─────────────────────────────────────────────────────────

type DialogState =
  | { type: "add-category" }
  | { type: "edit-category"; category: CategoryDB }
  | { type: "delete-category"; category: CategoryDB }
  | { type: "add-product"; categoryId: string; categorySlug: string }
  | { type: "edit-product"; product: DBProduct }
  | { type: "delete-product"; product: DBProduct };

// ─── Página ───────────────────────────────────────────────────────────────────

export default function Admin() {
  const { session, loading: authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verificando sesión...</p>
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return <AdminPanel onSignOut={signOut} />;
}

// ─── Panel principal ──────────────────────────────────────────────────────────

function AdminPanel({ onSignOut }: { onSignOut: () => void }) {
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();
  const { data: adminProducts, isLoading: productsLoading, refetch: refetchProducts } =
    useAdminProducts();

  const updateStatus = useUpdateOrderStatus();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateAvailability = useUpdateProductAvailability();

  const [activeTab, setActiveTab] = useState("orders");
  const [dialog, setDialog] = useState<DialogState | null>(null);

  // Formulario categoría
  const [catName, setCatName] = useState("");

  // Formulario producto
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodAvailable, setProdAvailable] = useState(true);

  // Agrupación de productos por categoría
  const productsByCategory = useMemo(() => {
    const map: Record<string, DBProduct[]> = {};
    (adminProducts ?? []).forEach((p) => {
      const key = p.category_id ?? "__sin_categoria__";
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [adminProducts]);

  const pendingOrders = orders?.filter((o) => o.status === "pending") ?? [];
  const validatedOrders = orders?.filter((o) => o.status === "validated") ?? [];
  const rejectedOrders = orders?.filter((o) => o.status === "rejected") ?? [];

  // ── Helpers WhatsApp ────────────────────────────────────────────────────────

  const openWhatsApp = (phone: string, message: string) => {
    const clean = phone.replace(/\D/g, "");
    const number = clean.startsWith("52") ? clean : `52${clean}`;
    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ── Handlers pedidos ────────────────────────────────────────────────────────

  const handleValidate = async (order: Order) => {
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: "validated" });
      toast.success("Pedido validado correctamente.");
      openWhatsApp(
        order.customer_phone,
        `✅ Hola ${order.customer_name}, tu pedido ha sido confirmado y estará listo pronto. ¡Gracias por elegirnos! 🥖`
      );
    } catch {
      toast.error("Error al validar el pedido.");
    }
  };

  const handleReject = async (order: Order) => {
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: "rejected" });
      toast.success("Pedido rechazado.");
      openWhatsApp(
        order.customer_phone,
        `❌ Hola ${order.customer_name}, lo sentimos, tu pedido no pudo ser procesado en este momento. Por favor contáctanos para más información.`
      );
    } catch {
      toast.error("Error al rechazar el pedido.");
    }
  };

  // ── Handlers categorías ─────────────────────────────────────────────────────

  const openAddCategory = () => {
    setCatName("");
    setDialog({ type: "add-category" });
  };

  const openEditCategory = (cat: CategoryDB) => {
    setCatName(cat.name);
    setDialog({ type: "edit-category", category: cat });
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) return;
    try {
      if (dialog?.type === "add-category") {
        await createCategory.mutateAsync({ name: catName.trim(), slug: toSlug(catName) });
        toast.success("Categoría creada.");
      } else if (dialog?.type === "edit-category") {
        await updateCategory.mutateAsync({
          id: dialog.category.id,
          name: catName.trim(),
          visible: dialog.category.visible,
        });
        toast.success("Categoría actualizada.");
      }
      setDialog(null);
    } catch (e: unknown) {
      toast.error("Error al guardar la categoría: " + (e instanceof Error ? e.message : ""));
    }
  };

  const handleToggleCategoryVisible = async (cat: CategoryDB) => {
    try {
      await updateCategory.mutateAsync({ id: cat.id, name: cat.name, visible: !cat.visible });
      toast.success(`Categoría ${!cat.visible ? "visible" : "oculta"}.`);
    } catch {
      toast.error("Error al actualizar visibilidad.");
    }
  };

  const handleDeleteCategory = async () => {
    if (dialog?.type !== "delete-category") return;
    try {
      await deleteCategory.mutateAsync(dialog.category.id);
      toast.success("Categoría eliminada junto con sus productos.");
      setDialog(null);
    } catch {
      toast.error("Error al eliminar la categoría.");
    }
  };

  // ── Handlers productos ──────────────────────────────────────────────────────

  const openAddProduct = (cat: CategoryDB) => {
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdImage("");
    setProdAvailable(true);
    setDialog({ type: "add-product", categoryId: cat.id, categorySlug: cat.slug });
  };

  const openEditProduct = (prod: DBProduct) => {
    setProdName(prod.name);
    setProdDesc(prod.description ?? "");
    setProdPrice(prod.price > 0 ? String(prod.price) : "");
    setProdImage(prod.image_url ?? "");
    setProdAvailable(prod.available);
    setDialog({ type: "edit-product", product: prod });
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim()) return;
    const price = parseFloat(prodPrice) || 0;
    try {
      if (dialog?.type === "add-product") {
        await createProduct.mutateAsync({
          name: prodName.trim(),
          description: prodDesc.trim(),
          price,
          image_url: prodImage.trim(),
          available: prodAvailable,
          category: dialog.categorySlug,
          category_id: dialog.categoryId,
        });
        toast.success("Producto agregado.");
      } else if (dialog?.type === "edit-product") {
        await updateProduct.mutateAsync({
          id: dialog.product.id,
          name: prodName.trim(),
          description: prodDesc.trim(),
          price,
          image_url: prodImage.trim(),
          available: prodAvailable,
        });
        toast.success("Producto actualizado.");
      }
      setDialog(null);
    } catch (e: unknown) {
      toast.error("Error al guardar el producto: " + (e instanceof Error ? e.message : ""));
    }
  };

  const handleToggleAvailability = async (prod: DBProduct) => {
    try {
      await updateAvailability.mutateAsync({ productId: prod.id, available: !prod.available });
      toast.success(`Producto marcado como ${!prod.available ? "disponible" : "no disponible"}.`);
    } catch {
      toast.error("Error al actualizar disponibilidad.");
    }
  };

  const handleDeleteProduct = async () => {
    if (dialog?.type !== "delete-product") return;
    try {
      await deleteProduct.mutateAsync(dialog.product.id);
      toast.success("Producto eliminado.");
      setDialog(null);
    } catch {
      toast.error("Error al eliminar el producto.");
    }
  };

  const isSaving =
    createCategory.isPending ||
    updateCategory.isPending ||
    createProduct.isPending ||
    updateProduct.isPending;

  const isDeleting = deleteCategory.isPending || deleteProduct.isPending;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo Panadería Suave" className="h-12 w-auto object-contain" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground text-sm">Panadería Suave</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchOrders();
              refetchCategories();
              refetchProducts();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-6">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Pendientes</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-3xl font-bold text-green-600">{validatedOrders.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Validados</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-3xl font-bold text-red-600">{rejectedOrders.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Rechazados</p>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 pb-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Pedidos
              {pendingOrders.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 ml-1">
                  {pendingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos
            </TabsTrigger>
          </TabsList>

          {/* ─── PEDIDOS ─── */}
          <TabsContent value="orders">
            {ordersLoading ? (
              <p className="text-muted-foreground text-center py-10">Cargando pedidos...</p>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">Aún no hay pedidos registrados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card rounded-xl border border-border p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{order.customer_name}</h3>
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full border",
                              STATUS_COLORS[order.status]
                            )}
                          >
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">📱 {order.customer_phone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.created_at).toLocaleString("es-MX")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          ${Number(order.total_price).toFixed(2)} MXN
                        </p>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Cant.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.order_items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell className="text-right">
                                ${Number(item.price).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right font-semibold">
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {order.status === "pending" && (
                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-400 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(order)}
                          disabled={updateStatus.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleValidate(order)}
                          disabled={updateStatus.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Validar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── PRODUCTOS ─── */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Gestión de Productos</h2>
              <Button size="sm" onClick={openAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Categoría
              </Button>
            </div>

            {categoriesLoading || productsLoading ? (
              <p className="text-muted-foreground text-center py-10">Cargando...</p>
            ) : !categories || categories.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No hay categorías. Agrega una para empezar.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((cat) => {
                  const prods = productsByCategory[cat.id] ?? [];
                  return (
                    <div
                      key={cat.id}
                      className="bg-card rounded-xl border border-border overflow-hidden"
                    >
                      {/* Encabezado de categoría */}
                      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-muted/40 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={cat.visible}
                            onCheckedChange={() => handleToggleCategoryVisible(cat)}
                            disabled={updateCategory.isPending}
                            aria-label={`Visibilidad de ${cat.name}`}
                          />
                          <span className="font-semibold text-foreground">{cat.name}</span>
                          {!cat.visible && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <EyeOff className="h-3 w-3" />
                              Oculta
                            </span>
                          )}
                          {cat.visible && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              Visible
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            ({prods.length} producto{prods.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditCategory(cat)}
                            title="Editar categoría"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDialog({ type: "delete-category", category: cat })}
                            title="Eliminar categoría"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Tabla de productos */}
                      {prods.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead className="text-right">Precio</TableHead>
                              <TableHead className="text-center">Disponible</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {prods.map((prod) => (
                              <TableRow key={prod.id}>
                                <TableCell className="font-medium">{prod.name}</TableCell>
                                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                  {prod.description || "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {prod.price > 0
                                    ? `$${Number(prod.price).toFixed(2)}`
                                    : "—"}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Switch
                                      checked={prod.available}
                                      onCheckedChange={() => handleToggleAvailability(prod)}
                                      disabled={updateAvailability.isPending}
                                    />
                                    <span
                                      className={cn(
                                        "text-xs font-medium",
                                        prod.available ? "text-green-600" : "text-destructive"
                                      )}
                                    >
                                      {prod.available ? "Sí" : "No"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                      onClick={() => openEditProduct(prod)}
                                      title="Editar producto"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() =>
                                        setDialog({ type: "delete-product", product: prod })
                                      }
                                      title="Eliminar producto"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}

                      {/* Botón agregar producto */}
                      <div className="px-5 py-3 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => openAddProduct(cat)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar producto
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Diálogo: Agregar / Editar Categoría ─── */}
      <Dialog
        open={dialog?.type === "add-category" || dialog?.type === "edit-category"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === "add-category" ? "Nueva categoría" : "Editar categoría"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ej. Pan de Yema"
                autoFocus
              />
            </div>
            {dialog?.type === "add-category" && catName && (
              <p className="text-xs text-muted-foreground">
                Slug: <span className="font-mono">{toSlug(catName)}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCategory} disabled={!catName.trim() || isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Diálogo: Agregar / Editar Producto ─── */}
      <Dialog
        open={dialog?.type === "add-product" || dialog?.type === "edit-product"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === "add-product" ? "Nuevo producto" : "Editar producto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="prod-name">Nombre *</Label>
              <Input
                id="prod-name"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="Ej. Concha de chocolate"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="prod-desc">Descripción breve</Label>
              <Textarea
                id="prod-desc"
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Describe brevemente el producto..."
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="prod-price">Precio (MXN)</Label>
              <Input
                id="prod-price"
                type="number"
                min="0"
                step="0.5"
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="prod-image">URL de imagen</Label>
              <Input
                id="prod-image"
                value={prodImage}
                onChange={(e) => setProdImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="prod-available"
                checked={prodAvailable}
                onCheckedChange={setProdAvailable}
              />
              <Label htmlFor="prod-available">
                {prodAvailable ? "Disponible en catálogo" : "No disponible"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct} disabled={!prodName.trim() || isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Diálogo: Confirmar eliminación ─── */}
      <Dialog
        open={dialog?.type === "delete-category" || dialog?.type === "delete-product"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              {dialog?.type === "delete-category" && (
                <>
                  ¿Estás seguro que quieres eliminar la categoría{" "}
                  <strong>{dialog.category.name}</strong>? Esto también eliminará todos sus
                  productos.
                </>
              )}
              {dialog?.type === "delete-product" && (
                <>
                  ¿Estás seguro que quieres eliminar el producto{" "}
                  <strong>{dialog.product.name}</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={
                dialog?.type === "delete-category" ? handleDeleteCategory : handleDeleteProduct
              }
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
