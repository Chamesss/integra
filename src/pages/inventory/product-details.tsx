import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Package, Edit } from "lucide-react";
import { Product } from "electron/models/product";
import useFetchAll from "@/hooks/useFetchAll";
import ProductDetailsSection from "@/components/products/details/product-details-section";
import ProductVariationSection from "@/components/products/details/product-variation-section";
import { cn } from "@/lib/utils";
import ProductDetailsSkeleton from "@/components/skeletons/product-info-section-skeleton";
import ProductNotFound from "@/components/fallbacks/product-not-found";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import ProductDeletePopup from "@/components/products/product-delete-popup";
import { FormActionProvider } from "@/redux/contexts/form-action.context";
import ProductAddNew from "@/components/products/product-form";
import { Variation } from "@/components/products/variations/types";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import OfflineBanner from "@/components/ui/offline-banner";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [isDeleteMode, setIsDeleteMode] = useState<boolean | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean | null>(null);
  const isOnline = useNetworkStatus();

  const {
    data: productResult,
    isLoading,
    error,
    refetch,
  } = useFetchAll<Product>({
    method: "product:getById",
    queryParams: { id },
    uniqueKey: `product-${id}`,
    fetcherLimit: 1,
    disableDefaultFilters: true,
    queryOptions: {
      refetchOnWindowFocus: false,
    },
    asData: true,
  });

  const product = productResult?.rows?.[0];

  const {
    data: variationsData,
    isLoading: isLoadingVariations,
    refetch: refetchVariants,
  } = useFetchAll<Variation>({
    method: "variation:getByProduct",
    queryParams: { productId: id },
    uniqueKey: `variations-${id}`,
    queryOptions: {
      refetchOnWindowFocus: false,
    },
  });

  const existingVariations = variationsData?.rows || [];

  if (isLoading) return <ProductDetailsSkeleton />;
  if (error || !product) return <ProductNotFound />;

  const isVariableProduct = product.type === "variable";
  const variationAttributes =
    product.attributes?.filter(
      (attr) => attr.variation && attr.options && attr.options.length > 0
    ) || [];
  const hasVariationAttributes = variationAttributes.length > 0;

  const sections = [
    {
      title: "Informations de produit",
      Icon: Package,
      value: "info",
      additionalInfo: null,
    },
    {
      title: "Variations de produit",
      Icon: Settings,
      value: "variations",
      additionalInfo:
        isVariableProduct &&
        hasVariationAttributes &&
        variationAttributes.length
          ? variationAttributes.length
          : null,
    },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "info":
        return <ProductDetailsSection product={product} />;
      case "variations":
        return (
          <ProductVariationSection
            product={product}
            refetch={refetch}
            isLoading={isLoadingVariations}
            refetchVariants={refetchVariants}
            variations={existingVariations}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <main className="flex flex-col h-screen w-full">
        <OfflineBanner />
        <div className="flex items-center justify-between px-6 pt-6 gap-4 border-b flex-col bg-white">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/inventory")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">{product.name}</h1>
                <p className="text-sm text-gray-500">
                  Gestion détaillée du produit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/inventory")}
                className="hidden sm:inline-flex"
              >
                Retour
              </Button>
              <Button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2"
                disabled={!isOnline}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isOnline
                    ? "Modifier produit"
                    : "Modifier produit (Hors ligne)"}
                </span>
              </Button>
              <SearchDropdownItem onDelete={() => setIsDeleteMode(true)} />
            </div>
          </div>
          <div className="w-full flex flex-row gap-0">
            {sections.map((section) => {
              const isVariationsTab = section.value === "variations";
              const isDisabled = isVariationsTab && !isOnline;

              return (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => !isDisabled && setActiveTab(section.value)}
                  key={section.value}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center relative border border-transparent gap-2 p-2 rounded-none",
                    {
                      "bg-gray-pale text-gray-900 border-t-input border-l-input border-r-input":
                        activeTab === section.value,
                      "text-gray-500": activeTab !== section.value,
                      "opacity-50 cursor-not-allowed": isDisabled,
                    }
                  )}
                >
                  <section.Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {section.title}
                    {isDisabled && " (Hors ligne)"}
                  </span>
                  <span className="sm:hidden">
                    {section.title}
                    {isDisabled && " (Hors ligne)"}
                  </span>
                  {section.additionalInfo && !isDisabled ? (
                    <span className="ml-1 flex items-center justify-center w-5 h-5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      <span className="m-auto">{section.additionalInfo}</span>
                    </span>
                  ) : null}
                  {section.value === activeTab ? (
                    <div className="absolute inset-x-0 top-full h-0.5 bg-gray-pale" />
                  ) : null}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar">{renderTab()}</div>
      </main>
      <ProductDeletePopup
        isDeleteMode={isDeleteMode}
        setIsDeleteMode={setIsDeleteMode}
        productId={product.id}
        products={[product]}
        redirect={() => navigate("/inventory")}
      />
      <FormActionProvider>
        <ProductAddNew
          key={`product-edit-${product.id}-${product.date_modified}`}
          isAdding={isEditMode}
          setIsAdding={setIsEditMode}
          refetch={() => {
            refetch();
            refetchVariants();
          }}
          mode="edit"
          product={product}
        />
      </FormActionProvider>
    </>
  );
}
