import { Layers } from "lucide-react";
import { Product } from "electron/models/product";
import { ExtractedCard } from "@/components/attributes/attributes-card";
import InfoSection from "./info-section";

interface Props {
  product: Product;
}

export default function ProductAttributes({ product }: Props) {
  if (!product.attributes || product.attributes.length === 0) {
    return null;
  }

  return (
    <InfoSection
      icon={Layers}
      title="Attributs"
      color="indigo"
      badge={product.attributes.length}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {product.attributes.map((attribute, index) => (
          <ExtractedCard
            name={attribute.name}
            options={attribute.options}
            isVisible={attribute.visible}
            key={index}
          />
        ))}
      </div>
    </InfoSection>
  );
}
