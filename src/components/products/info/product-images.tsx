import {
  Image as ImageIcon,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Product } from "electron/models/product";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import InfoSection from "./info-section";

interface Props {
  product: Product;
  onImageModalChange?: (isOpen: boolean) => void;
}

export default function ProductImages({ product, onImageModalChange }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const images = [...product.images];

  // Global escape key handler with high priority for image modal
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (selectedImage) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          closeImageModal();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          navigateToPreviousImage();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          navigateToNextImage();
        }
      }
    };

    if (selectedImage) {
      // Add with capture and high priority
      document.addEventListener("keydown", handleGlobalKeyDown, {
        capture: true,
        passive: false,
      });
    }

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown, {
        capture: true,
      });
    };
  }, [selectedImage, selectedImageIndex]);

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageClick = (imageSrc: string) => {
    const index = images.findIndex((img) => img.src === imageSrc);
    setSelectedImage(imageSrc);
    setSelectedImageIndex(index);
    onImageModalChange?.(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setSelectedImageIndex(0);
    onImageModalChange?.(false);
  };

  // Navigation functions for image preview
  const navigateToPreviousImage = () => {
    if (!images || images.length <= 1) return;

    const newIndex =
      selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1;
    const newImage = images[newIndex];

    if (newImage?.src) {
      setSelectedImage(newImage.src);
      setSelectedImageIndex(newIndex);
    }
  };

  const navigateToNextImage = () => {
    if (!images || images.length <= 1) return;

    const newIndex =
      selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0;
    const newImage = images[newIndex];

    if (newImage?.src) {
      setSelectedImage(newImage.src);
      setSelectedImageIndex(newIndex);
    }
  };

  // Thumbnail gallery navigation (existing functionality)
  const scroll = (amount: number) =>
    scrollContainerRef.current?.scrollBy({ left: amount, behavior: "smooth" });

  return (
    <>
      <InfoSection
        title="Galerie d'images"
        icon={ImageIcon}
        color="pink"
        badge={{
          content: `${images.length} image${images.length > 1 ? "s" : ""}`,
          variant: "secondary",
        }}
      >
        <div className="relative">
          {/* Scroll Controls */}
          {images.length > 3 && (
            <>
              <motion.button
                onClick={() => scroll(-300)}
                className="absolute -left-3 top-1/2 cursor-pointer -translate-y-1/2 z-10 w-8 h-8 bg-black/20 hover:bg-black/30 rounded-full shadow-lg flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </motion.button>
              <motion.button
                onClick={() => scroll(300)}
                className="absolute -right-3 top-1/2 cursor-pointer -translate-y-1/2 z-10 w-8 h-8 bg-black/20 hover:bg-black/30 rounded-full shadow-lg flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </motion.button>
            </>
          )}

          {/* Horizontal Scrolling Gallery */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 cursor-pointer flex-shrink-0"
                style={{ width: "150px", height: "150px" }}
                onClick={() => image.src && handleImageClick(image.src)}
              >
                {image.src ? (
                  <>
                    <motion.img
                      src={image.src}
                      alt={image.alt || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ZoomIn className="w-6 h-6 text-white" />
                      </motion.div>
                    </motion.div>
                    {index === 0 && (
                      <motion.div
                        className="absolute top-2 left-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <div className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                          Principal
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {images.length > 0 && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <p className="text-xs text-gray-500 text-center">
              Cliquez sur une image pour l'agrandir • Faites défiler
              horizontalement pour voir plus
            </p>
          </motion.div>
        )}
      </InfoSection>

      {/* Image Modal/Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 h-screen flex items-center justify-center z-50 p-4"
            onClick={closeImageModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToPreviousImage();
                  }}
                  className="absolute left-4 top-1/2 cursor-pointer -translate-y-1/2 z-10 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToNextImage();
                  }}
                  className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </>
            )}

            <motion.div
              className="relative max-w-4xl max-h-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedImage} // Key helps with transitions between images
                src={selectedImage}
                alt="Agrandie"
                className="max-w-full max-h-[95vh] object-contain rounded-lg"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Close Button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 cursor-pointer right-4 w-8 h-8 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Counter */}
              {images.length > 1 && (
                <motion.div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white rounded-full text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {selectedImageIndex + 1} / {images.length}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
