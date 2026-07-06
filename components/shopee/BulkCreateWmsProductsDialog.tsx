"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, CheckCircle2, AlertCircle } from "lucide-react";
import {
  useCategories,
  useSuppliers,
  useBulkCreateWmsProducts,
} from "@/hooks/queries";
import { DeferredSelectGate } from "@/components/shared";

interface ShopeeProductForBulk {
  id: string;
  shopeeItemId: number;
  itemName: string;
}

interface BulkCreateWmsProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ShopeeProductForBulk[];
  onComplete: () => void;
}

export default function BulkCreateWmsProductsDialog({
  open,
  onOpenChange,
  products,
  onComplete,
}: BulkCreateWmsProductsDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [supplierError, setSupplierError] = useState("");

  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const bulkCreateMutation = useBulkCreateWmsProducts();

  const activeCategories = categories.filter((c) => c.status !== false);
  const activeSuppliers = suppliers.filter((s) => s.status !== false);

  const handleSubmit = async () => {
    setCategoryError("");
    setSupplierError("");

    let valid = true;
    if (!selectedCategory) {
      setCategoryError("Category is required");
      valid = false;
    }
    if (!selectedSupplier) {
      setSupplierError("Supplier is required");
      valid = false;
    }
    if (!valid) return;

    bulkCreateMutation.mutate(
      {
        shopeeProductIds: products.map((p) => p.id),
        categoryId: selectedCategory,
        supplierId: selectedSupplier,
      },
    );
  };

  const handleClose = () => {
    if (result) {
      onComplete();
    } else {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedCategory("");
      setSelectedSupplier("");
      setCategoryError("");
      setSupplierError("");
    }
    onOpenChange(isOpen);
  };

  const result = bulkCreateMutation.data;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bulk Create WMS Products
          </DialogTitle>
          <DialogDescription>
            Create inventory products from {products.length} selected Shopee listing(s).
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            {/* Results */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">
                  {result.created} product(s) created
                </span>
              </div>
              {result.skipped > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {result.skipped} skipped (already mapped)
                  </span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-destructive">{err}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected products preview */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Selected Products</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{p.itemName}</span>
                    <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                      {p.shopeeItemId}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <DeferredSelectGate
                enabled={open}
                placeholder={
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                    Select a category
                  </div>
                }
              >
                {() => (
                  <Select
                    value={selectedCategory}
                    onValueChange={(val) => {
                      setSelectedCategory(val);
                      setCategoryError("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </DeferredSelectGate>
              {categoryError && (
                <p className="text-xs text-destructive">{categoryError}</p>
              )}
            </div>

            {/* Supplier selection */}
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <DeferredSelectGate
                enabled={open}
                placeholder={
                  <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                    Select a supplier
                  </div>
                }
              >
                {() => (
                  <Select
                    value={selectedSupplier}
                    onValueChange={(val) => {
                      setSelectedSupplier(val);
                      setSupplierError("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSuppliers.map((sup) => (
                        <SelectItem key={sup.id} value={sup.id}>
                          {sup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </DeferredSelectGate>
              {supplierError && (
                <p className="text-xs text-destructive">{supplierError}</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={bulkCreateMutation.isPending}
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              onClick={handleSubmit}
              disabled={bulkCreateMutation.isPending}
            >
              {bulkCreateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                `Create ${products.length} Product(s)`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
