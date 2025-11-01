import { CreateProductDto } from "electron/types/product.types";
import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";
import { Reorder } from "motion/react";
import { Label } from "../ui/label";

interface Props {
  imageItems: CreateProductDto["images"];
  setImageItems: React.Dispatch<
    React.SetStateAction<CreateProductDto["images"]>
  >;
}

export default function ImageReorder({ imageItems, setImageItems }: Props) {
  const removeImage = (index: number) => {
    if (!imageItems || index < 0 || index >= imageItems.length) return;
    const updatedImages = [...imageItems];
    updatedImages.splice(index, 1);
    setImageItems(updatedImages);
  };

  const extractFileName = (
    image: NonNullable<CreateProductDto["images"]>[number]
  ) => {
    if (image.file === null) {
      if (image.preview?.startsWith("https://")) {
        const name = image.preview.split("/").pop();
        return name ? decodeURIComponent(name) : "Image";
      } else return image.preview || "Image";
    } else if (image.file && typeof image.file !== "string") {
      return image.file.name || "Image";
    } else return "Image";
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const newImages: CreateProductDto["images"] = [];

    let loadedCount = 0;

    fileArray.forEach((file) => {
      const isDuplicate = imageItems?.some(
        (img) =>
          typeof img.file !== "string" &&
          img.file?.name === file.name &&
          img.file.size === file.size
      );
      if (isDuplicate) {
        loadedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          newImages.push({
            file,
            preview: URL.createObjectURL(file),
          });
        }

        loadedCount++;
        if (loadedCount === fileArray.length) {
          setImageItems([...(imageItems || []), ...newImages]); // ✅ update once
        }
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="images" className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            className="pointer-events-none bg-transparent"
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger les images
          </Button>
        </Label>
        <input
          id="images"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <p className="text-sm text-gray-500">
          Sélectionnez plusieurs images (JPG, PNG, GIF)
        </p>
      </div>
      {(imageItems?.length ?? 0) > 0 ? (
        <div className="space-y-2">
          <hr className="my-6" />
          <p className="text-sm text-gray-600">
            Glissez-déposez pour réorganiser les images
          </p>
          <Reorder.Group
            values={imageItems || []}
            onReorder={setImageItems}
            className="space-y-3"
            layoutScroll
            style={{ overflow: "visible" }}
          >
            {imageItems?.map((item, index) => (
              <Reorder.Item
                key={item.preview}
                id={item.preview || `image-${index}`}
                value={item}
                layoutId={item.preview}
                className="relative group cursor-grab active:cursor-grabbing"
                whileDrag={{
                  scale: 1.02,
                  zIndex: 1000,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  borderRadius: "12px",
                }}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <div className="flex items-center gap-4 p-3 bg-white border-2 border-gray-200 rounded-lg group-hover:border-blue-400 group-hover:shadow-md transition-all">
                  <div className="flex flex-col gap-1 text-gray-400 group-hover:text-gray-600">
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                  </div>

                  <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                    <img
                      src={item.preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {extractFileName(item)}
                    </p>
                    {typeof item.file !== "string" && item.file?.size ? (
                      <p className="text-xs text-gray-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    ) : null}
                  </div>

                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      ) : null}
    </>
  );
}
