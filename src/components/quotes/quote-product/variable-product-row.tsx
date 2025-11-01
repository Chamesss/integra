import { Checkbox } from "../../ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { formatCurrency } from "@/utils/text-formatter";
import { Product } from "@electron/models/product";
import { ProductVariation } from "@electron/types/product.types";
import { SelectedProduct } from "@electron/types/quote.types";
import ClientsMenuLoading from "@/components/ui/misc/clients-menu-loading";
import { ChevronDown } from "lucide-react";
import ProductImage from "./product-image";

interface VariableProductRowProps {
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

export default function VariableProductRow({
  product,
  isExpanded,
  variations,
  isLoadingVariations,
  selectedProducts,
  onToggleExpansion,
  onVariationToggle,
}: VariableProductRowProps) {
  const isVariationSelected = (variationId: number) => {
    return selectedProducts.some(
      (p) => p.variation_id === variationId.toString()
    );
  };

  const handleAccordionChange = () => onToggleExpansion(product.id);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? product.id.toString() : ""}
        onValueChange={handleAccordionChange}
      >
        <AccordionItem value={product.id.toString()} className="border-none">
          <AccordionTrigger
            noIcon
            className="flex items-center cursor-pointer min-h-[3.25rem] gap-3 px-0.5 py-1 hover:bg-gray-50 hover:no-underline [&[data-state=open]>div]:bg-gray-50"
          >
            <ChevronDown className="h-5 w-5 text-gray-600 transition-all" />
            <div className="flex items-center gap-3 flex-1">
              <ProductImage images={product.images} />
              <div className="flex-1">
                <div className="font-medium">
                  {product.name}
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Variable
                  </span>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-2">
            <div className="pl-[1.9rem]">
              {isLoadingVariations ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <ClientsMenuLoading
                    size="sm"
                    key={index}
                    className="py-2 pl-1 pr-10"
                  />
                ))
              ) : variations.length === 0 ? (
                <div className="py-2 mr-8 text-center text-xs text-gray-500">
                  Aucune variation disponible
                </div>
              ) : (
                <div className="space-y-1">
                  {variations.map((variation) => {
                    const isVariationChecked = isVariationSelected(
                      variation.id
                    );
                    return (
                      <div
                        key={variation.id}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100"
                      >
                        <Checkbox
                          checked={isVariationChecked}
                          onCheckedChange={(checked) =>
                            onVariationToggle(product, variation, !!checked)
                          }
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {variation.attributes
                              .map((attr) => attr.option)
                              .join(", ")}
                            {variation.on_sale && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                En promo
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>Stock: {variation.stock_quantity || 0}</span>
                            <span>•</span>
                            <span
                              className={
                                variation.on_sale
                                  ? "text-red-600 font-semibold"
                                  : ""
                              }
                            >
                              {formatCurrency(variation.regular_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
