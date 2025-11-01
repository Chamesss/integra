import { Product } from "@electron/models/product";
import { ProductVariation } from "@electron/types/product.types";
import { SelectedProduct, StockWarning } from "@electron/types/quote.types";

export interface QuoteProductsSectionProps {
  selectedProducts: SelectedProduct[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  stockWarnings: StockWarning[];
  setStockWarnings: React.Dispatch<React.SetStateAction<StockWarning[]>>;
}

export interface ProductSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: SelectedProduct[];
  onProductsSelected: (products: SelectedProduct[]) => void;
}

export interface SelectedProductsTableProps {
  selectedProducts: SelectedProduct[];
  stockWarnings: StockWarning[];
  onRemoveProduct: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onUpdateTva: (productId: number, tva: number) => void;
}

export interface VariableProductRowProps {
  product: Product;
  isExpanded: boolean;
  variations: ProductVariation[];
  isLoadingVariations: boolean;
  selectedProducts: SelectedProduct[];
  onToggleExpansion: (productId: number) => void;
  onVariationToggle: (
    product: Product,
    variation: ProductVariation,
    checked: boolean
  ) => void;
  onProductToggle: (product: Product, checked: boolean) => void;
}

export interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  onProductToggle: (product: Product, checked: boolean) => void;
  renderProductImage: (images: Product["images"]) => JSX.Element;
}
