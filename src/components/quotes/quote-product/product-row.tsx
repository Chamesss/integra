import { Checkbox } from "../../ui/checkbox";
import { formatCurrency } from "@/utils/text-formatter";
import { getProductPrice, isProductOnSale } from "@/utils/product-price";
import { Product } from "@electron/models/product";

interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  onProductToggle: (product: Product, checked: boolean) => void;
  renderProductImage: (images: Product["images"]) => JSX.Element;
}

export default function ProductRow({
  product,
  isSelected,
  onProductToggle,
  renderProductImage,
}: ProductRowProps) {
  const handleCheckboxChange = (checked: boolean | string) => {
    // Prevent event propagation to avoid double firing
    onProductToggle(product, !!checked);
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't toggle if the click is on the checkbox
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    onProductToggle(product, !isSelected);
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className="flex group items-center gap-3 p-1 hover:bg-gray-50 cursor-pointer"
        onClick={handleRowClick}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
          />
        </div>

        {renderProductImage(product.images)}

        <div className="flex-1">
          <div className="font-medium group-hover:underline">
            {product.name}
            {isProductOnSale(product) && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                En promo
              </span>
            )}
          </div>
          <div className="text-sm group-hover:underline text-gray-500 flex items-center gap-2">
            <span>Stock: {product.stock_quantity || 0}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span
                className={
                  isProductOnSale(product) ? "text-red-600 font-semibold" : ""
                }
              >
                {formatCurrency(getProductPrice(product))}
              </span>
              {isProductOnSale(product) && product.regular_price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.regular_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
