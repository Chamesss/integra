import { Badge } from "@/components/ui/badge";
import { FolderOpen, Tag } from "lucide-react";
import { Product } from "electron/models/product";
import InfoSection from "./info-section";

interface Props {
  product: Product;
}

export default function ProductCategories({ product }: Props) {
  if (!product.categories || product.categories.length === 0) {
    return null;
  }

  return (
    <InfoSection
      title="Catégories"
      icon={FolderOpen}
      color="orange"
      badge={{
        content: `${product.categories.length} catégorie${
          product.categories.length > 1 ? "s" : ""
        }`,
        variant: "secondary",
      }}
    >
      <div className="flex flex-wrap space-y-3 gap-2">
        {product.categories.map((category) => (
          <Badge
            key={category.id}
            variant="outline"
            className="px-2.5 py-1 h-fit text-sm font-medium border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-default"
          >
            <Tag className="w-3 h-3 mr-1.5 text-gray-500" />
            {category.name}
          </Badge>
        ))}
      </div>
    </InfoSection>
  );
}
