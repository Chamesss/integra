import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import useFetchAll from "@/hooks/useFetchAll";
import ClientsMenuLoading from "../../ui/misc/clients-menu-loading";
import { Product } from "@electron/models/product";
import { ProductVariation } from "@electron/types/product.types";
import { SelectedProduct } from "@electron/types/quote.types";
import { getProductPrice, isProductOnSale } from "@/utils/product-price";
import ProductRow from "./product-row";
import VariableProductRow from "./variable-product-row";
import { ProductSelectionDialogProps } from "./types";

export default function ProductSelectionDialog({
  isOpen,
  onClose,
  selectedProducts,
  onProductsSelected,
}: ProductSelectionDialogProps) {
  const [tempSelectedProducts, setTempSelectedProducts] = useState<
    SelectedProduct[]
  >([]);

  // State for managing variable products and their variations
  const [expandedVariableProducts, setExpandedVariableProducts] = useState<
    Set<number>
  >(new Set());
  const [productVariations, setProductVariations] = useState<
    Record<number, ProductVariation[]>
  >({});
  const [loadingVariations, setLoadingVariations] = useState<Set<number>>(
    new Set()
  );

  const {
    data: products,
    setSearchQuery,
    searchQuery,
    isLoading,
    error,
  } = useFetchAll<Product>({
    method: "product:getAll",
    search_key: "name",
    fetcherLimit: 1000,
    uniqueKey: "quote-product-selection",
    queryOptions: {
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      setTempSelectedProducts([...selectedProducts]);
    }
  }, [isOpen, selectedProducts]);

  const handleProductToggle = (product: Product, checked: boolean) => {
    if (checked) {
      const isAlreadySelected = tempSelectedProducts.some(
        (p) => p.id === product.id
      );
      if (isAlreadySelected) return;

      const newProduct: SelectedProduct = {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: getProductPrice(product),
        stock_quantity: product.stock_quantity || 0,
        images: product.images || [],
        tva: 19,
        regular_price: product.regular_price,
        is_on_sale: isProductOnSale(product),
      };
      setTempSelectedProducts((prev) => [...prev, newProduct]);
    } else {
      setTempSelectedProducts((prev) =>
        prev.filter((p) => p.id !== product.id)
      );
    }
  };

  // Handle variable product expansion
  const handleVariableProductToggle = async (productId: number) => {
    const isExpanded = expandedVariableProducts.has(productId);

    if (isExpanded) {
      setExpandedVariableProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } else {
      setExpandedVariableProducts((prev) => new Set(prev).add(productId));

      if (!productVariations[productId]) {
        setLoadingVariations((prev) => new Set(prev).add(productId));

        try {
          const result = await window.ipcRenderer.invoke(
            "variation:getByProduct",
            { productId }
          );
          const variations = result?.rows || [];

          setProductVariations((prev) => ({
            ...prev,
            [productId]: variations,
          }));
        } catch (error) {
          console.error("Error fetching variations:", error);
          setProductVariations((prev) => ({
            ...prev,
            [productId]: [],
          }));
        } finally {
          setLoadingVariations((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      }
    }
  };

  // Handle variation selection
  const handleVariationToggle = (
    product: Product,
    variation: ProductVariation,
    checked: boolean
  ) => {
    if (checked) {
      const isAlreadySelected = tempSelectedProducts.some(
        (p) => p.variation_id === variation.id.toString()
      );
      if (isAlreadySelected) return;

      const uniqueId = Number(variation.id) * 10000 + (Date.now() % 10000);

      const newProduct: SelectedProduct = {
        id: uniqueId,
        name: `${product.name} - ${variation.attributes.map((attr: { name: string; option: string }) => attr.option).join(", ")}`,
        quantity: 1,
        price: variation.regular_price || "0",
        stock_quantity: variation.stock_quantity || 0,
        images: product.images || [],
        tva: 19,
        regular_price: variation.regular_price,
        is_on_sale: variation.on_sale,
        variation_id: variation.id.toString(),
        parent_product_id: product.id,
        variation_attributes: variation.attributes,
      };
      setTempSelectedProducts((prev) => [...prev, newProduct]);
    } else {
      setTempSelectedProducts((prev) =>
        prev.filter((p) => p.variation_id !== variation.id.toString())
      );
    }
  };

  const isProductSelected = (productId: number) => {
    const isSelected = tempSelectedProducts.some((p) => {
      if (p.id === productId && !p.variation_id && !p.parent_product_id)
        return true;
      if (!p.variation_id && !p.parent_product_id) {
        const possibleOriginalId = Math.floor(p.id / 10000);
        if (possibleOriginalId === productId) return true;
      }
      if (p.parent_product_id === productId) return false;

      if (p.id === productId && !p.variation_id) return true;

      return false;
    });
    return isSelected;
  };

  const handleAddSelected = () => {
    onProductsSelected(tempSelectedProducts);
    onClose();
    setTempSelectedProducts([]);
  };

  const handleDialogClose = () => {
    onClose();
    setTempSelectedProducts([]);
  };

  const renderProductImage = (images: Product["images"]) => (
    <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0">
      {images && images.length > 0 && (
        <img
          src={images[0].src || ""}
          alt={images[0].alt || ""}
          className="w-full h-full object-cover rounded"
        />
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl flex flex-col h-[90vh] max-h-[47.5rem]">
        <DialogHeader className="h-fit">
          <DialogTitle>Liste de produits</DialogTitle>
        </DialogHeader>

        <div className="flex-1 justify-between flex flex-col gap-2">
          {/* Search Bar */}
          <div className="flex h-fit gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Product List */}
          <div className="max-h-[55vh] h-full overflow-y-auto scrollbar rounded-lg">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <ClientsMenuLoading key={index} />
              ))
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                Erreur de chargement des produits
              </div>
            ) : products?.rows.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucun produit trouvé
              </div>
            ) : (
              products?.rows.map((product) => {
                const isSelected = isProductSelected(product.id);
                const isVariableProduct = product.type === "variable";
                const isExpanded = expandedVariableProducts.has(product.id);
                const variations = productVariations[product.id] || [];
                const isLoadingVariations = loadingVariations.has(product.id);

                return isVariableProduct ? (
                  <VariableProductRow
                    key={product.id}
                    product={product}
                    isExpanded={isExpanded}
                    variations={variations}
                    isLoadingVariations={isLoadingVariations}
                    selectedProducts={tempSelectedProducts}
                    onToggleExpansion={handleVariableProductToggle}
                    onVariationToggle={handleVariationToggle}
                    onProductToggle={handleProductToggle}
                  />
                ) : (
                  <ProductRow
                    key={product.id}
                    product={product}
                    isSelected={isSelected}
                    onProductToggle={handleProductToggle}
                    renderProductImage={renderProductImage}
                  />
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setTempSelectedProducts([])}
            >
              Réinitialiser
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={tempSelectedProducts.length === 0}
            >
              Ajouter ({tempSelectedProducts.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
