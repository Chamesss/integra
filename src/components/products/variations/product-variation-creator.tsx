import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Product } from "electron/models/product";
import { StockStatus } from "@electron/types/product.types";
import {
  VariationStepIndicator,
  AttributeConfigurationStep,
  VariationPreviewStep,
  VariationConfirmationStep,
  VariationFooterActions,
} from "./steps";
import { AttributeConfig, Variation, WorkflowStep } from "./types";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  existingVariations?: Variation[];
  onSuccess: () => void;
}

export default function ProductVariationCreator({
  product,
  isOpen,
  onClose,
  existingVariations = [],
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("attributes");
  const [attributeConfigs, setAttributeConfigs] = useState<AttributeConfig[]>(
    () =>
      product.attributes?.map((attr) => ({
        id: attr.id,
        name: attr.name,
        terms: attr.options || [],
        selected: attr.variation || false,
        forVariation: attr.variation || false,
      })) || []
  );
  const [generatedVariations, setGeneratedVariations] = useState<Variation[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const { mutate: createProductVariations, isPending: creatingVariations } =
    useMutation();
  const { showToast } = useToastLoader();

  useEffect(() => {
    !isOpen && setCurrentStep("attributes");
  }, [isOpen]);

  useEffect(() => {
    const attributes =
      product.attributes?.map((attr) => ({
        id: attr.id,
        name: attr.name,
        terms: attr.options || [],
        selected: attr.variation || false,
        forVariation: attr.variation || false,
      })) || [];
    setAttributeConfigs(attributes);
  }, [product]);

  // Generate all possible variations from selected attributes
  const generateVariations = () => {
    setIsGenerating(true);

    const selectedAttrs = attributeConfigs.filter(
      (attr) => attr.selected && attr.terms.length > 0
    );

    if (selectedAttrs.length === 0) {
      setGeneratedVariations([]);
      setIsGenerating(false);
      return;
    }

    // Generate all combinations
    const combinations: { id: number; name: string; option: string }[][] = [];

    const generateCombos = (
      index: number,
      current: { [key: string]: { id: number; name: string; option: string } }
    ) => {
      if (index === selectedAttrs.length) {
        combinations.push(Object.values(current));
        return;
      }

      const attr = selectedAttrs[index];
      for (const term of attr.terms) {
        current[attr.name] = { id: attr.id, name: attr.name, option: term };
        generateCombos(index + 1, current);
      }
    };

    generateCombos(0, {});

    // Filter out existing combinations
    const newCombinations = combinations.filter((combo) => {
      return !existingVariations.some((existing) => {
        if (!existing.attributes || existing.attributes.length === 0)
          return false;

        // Check if all attributes match exactly
        return (
          combo.every((attr) =>
            existing.attributes.some(
              (existingAttr) =>
                existingAttr.id === attr.id &&
                existingAttr.option === attr.option
            )
          ) && existing.attributes.length === combo.length
        );
      });
    });

    // Create variation objects with unique SKUs
    const variations: Variation[] = newCombinations.map((combo, index) => {
      // Generate a more unique SKU by adding timestamp and random suffix
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 5)
        .toUpperCase();
      const baseSkuFromCombo = combo
        .map((attr) => attr.option.replace(/\s+/g, ""))
        .join("-");
      const uniqueSku = `${product.sku || "PROD"}-${baseSkuFromCombo}-${timestamp}-${randomSuffix}`;

      return {
        id: `variation-${index}`,
        attributes: combo,
        sku: uniqueSku,
        regular_price: product.regular_price || "0",
        stock_quantity: 0,
        enabled: true,
      };
    });

    setGeneratedVariations(variations);
    setIsGenerating(false);
  };

  const toggleAttributeSelection = (attrId: number) => {
    setAttributeConfigs((prev) =>
      prev.map((attr) =>
        attr.id === attrId ? { ...attr, selected: !attr.selected } : attr
      )
    );
  };

  const updateVariation = (variationId: string, field: string, value: any) => {
    setGeneratedVariations((prev) =>
      prev.map((variation) =>
        variation.id === variationId
          ? { ...variation, [field]: value }
          : variation
      )
    );
  };

  const deleteVariation = (variationId: string) => {
    setGeneratedVariations((prev) =>
      prev.filter((variation) => variation.id !== variationId)
    );
  };

  const handleNext = () => {
    if (currentStep === "attributes") {
      generateVariations();
      setCurrentStep("preview");
    } else if (currentStep === "preview") {
      setCurrentStep("confirm");
    }
  };

  const handleBack = () => {
    if (currentStep === "preview") {
      setCurrentStep("attributes");
    } else if (currentStep === "confirm") {
      setCurrentStep("preview");
    }
  };

  const handleConfirm = async () => {
    const toastId = "product-variation-toast";
    showToast("loading", "Creation de variations en cours...", {
      id: toastId,
      duration: Infinity,
    });

    const variationsData = generatedVariations.map((v) => ({
      regular_price: v.regular_price.toString(), // WooCommerce expects string
      sku: v.sku, // Use `sku`, not `regular_sku`
      attributes: v.attributes, // Make sure each attribute has `id` and `option`
      stock_quantity: v.stock_quantity, // Include stock quantity
      manage_stock: true, // Enable stock management
      stock_status:
        v.stock_quantity > 0 ? StockStatus.InStock : StockStatus.OutOfStock, // Set stock status based on quantity
      image: {
        id: product.images[0]?.id,
      },
    }));

    const data = {
      productId: product.id,
      variations: variationsData,
    };

    createProductVariations(
      { method: "variation:create", data },
      {
        onSuccess: (res) => {
          if (res.success) {
            showToast("success", "Variations créées avec succès !", {
              duration: 3000,
              id: toastId,
            });
            queryClient.refetchQueries({
              queryKey: ["variation:getAll", { productId: product.id }],
            });
            onSuccess();
            onClose();
          } else {
            showToast("error", "Erreur lors de la création des variations !", {
              duration: 3000,
              id: toastId,
            });
          }
        },
        onError: () => {
          showToast("error", "Erreur lors de la création des variations !", {
            duration: 3000,
            id: toastId,
          });
        },
      }
    );
  };

  const selectedAttributes = attributeConfigs.filter((attr) => attr.selected);
  const hasSelectedAttributes = selectedAttributes.length > 0;
  const hasValidTerms = selectedAttributes.every(
    (attr) => attr.terms.length > 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[50rem] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gérer les variations pour {product.name}
          </DialogTitle>
          <DialogDescription>
            Configurez les attributs et générez de nouvelles variations pour ce
            produit variable.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full max-h-[60vh]">
          <VariationStepIndicator currentStep={currentStep} />

          <div className="flex-1 overflow-y-auto px-1 py-2 scrollbar">
            {currentStep === "attributes" && (
              <AttributeConfigurationStep
                product={product}
                attributeConfigs={attributeConfigs}
                onToggleAttribute={toggleAttributeSelection}
              />
            )}

            {currentStep === "preview" && (
              <VariationPreviewStep
                variations={generatedVariations}
                isGenerating={isGenerating}
                onRegenerate={generateVariations}
                onUpdateVariation={updateVariation}
                onDeleteVariation={deleteVariation}
              />
            )}

            {currentStep === "confirm" && (
              <VariationConfirmationStep
                product={product}
                selectedAttributes={selectedAttributes}
                variations={generatedVariations}
              />
            )}
          </div>
        </div>

        <VariationFooterActions
          isLoading={creatingVariations}
          currentStep={currentStep}
          hasSelectedAttributes={hasSelectedAttributes}
          hasValidTerms={hasValidTerms}
          enabledVariationsCount={
            generatedVariations.filter((v) => v.enabled).length
          }
          onBack={handleBack}
          onNext={handleNext}
          onConfirm={handleConfirm}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
