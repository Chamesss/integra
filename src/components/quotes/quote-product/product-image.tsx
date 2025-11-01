import { Product } from "@electron/models/product";
import { Package } from "lucide-react";

export default function ProductImage({
  images,
}: {
  images: Product["images"];
}) {
  return (
    <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0">
      {images && images.length > 0 ? (
        <img
          src={images[0].src || ""}
          alt={images[0].alt || ""}
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <Package className="text-blue-600 bg-blue-100 p-1.5 w-full h-full object-cover rounded" />
      )}
    </div>
  );
}
