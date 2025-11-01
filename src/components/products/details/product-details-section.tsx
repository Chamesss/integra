import { Product } from "@electron/models";
import ProductBasicInfo from "../info/product-basic-info";
import ProductAttributes from "../info/product-attributes";
import ProductCategories from "../info/product-categories";
import ProductMetadata from "../info/product-metadata";
import ProductPricing from "../info/product-pricing";
import ProductInventory from "../info/product-inventory";
import ProductShipping from "../info/product-shipping";
import ProductImages from "../info/product-images";

interface Props {
  product: Product;
}

export default function ProductDetailsSection({ product }: Props) {
  const isVariableProduct = product.type === "variable";
  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ProductBasicInfo product={product} />
          <ProductAttributes product={product} />
          <ProductImages product={product} />
        </div>
        <div className="space-y-6">
          {!isVariableProduct ? <ProductPricing product={product} /> : null}
          <ProductInventory product={product} />
          <ProductShipping product={product} />
          <ProductCategories product={product} />
          <ProductMetadata product={product} />
        </div>
      </div>
      <div className="mt-6"></div>
    </div>
  );
}
