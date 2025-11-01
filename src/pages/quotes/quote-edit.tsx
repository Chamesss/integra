import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import QuoteClientSection from "@/components/quotes/quote-client-section";
import QuoteProductsSection from "@/components/quotes/quote-product";
import QuoteDiscountSection from "@/components/quotes/quote-discount-section";
import QuotePaymentSummary from "@/components/quotes/quote-payment-summary";
import {
  Quote,
  QuoteFormData,
  SelectedProduct,
  StockWarning,
  UpdateQuoteDto,
} from "@electron/types/quote.types";
import { Client } from "@electron/models/client";
import { useMutation } from "@/hooks/useMutation";
import useFetchAll from "@/hooks/useFetchAll";
import { calculateTotals } from "@/utils/product-price";

export default function QuoteEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [stockWarnings, setStockWarnings] = useState<StockWarning[]>([]);

  const methods = useForm<QuoteFormData>({
    defaultValues: {
      discount_percentage: 0,
      tax_percentage: 19,
      valid_until: "",
    },
  });

  const {
    data: quoteResult,
    isLoading,
    error,
  } = useFetchAll<Quote>({
    method: "quote:getById",
    queryParams: { id },
    uniqueKey: `quote-${id}`,
    fetcherLimit: 1,
    disableDefaultFilters: true,
    asData: true,
    queryOptions: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  // Get the quote from the transformed results
  const quote = quoteResult?.rows?.[0] || null;

  // Mutation for updating quote
  const { mutate: updateQuote, isPending } = useMutation<
    UpdateQuoteDto,
    Quote,
    any
  >();

  // Update state when quote data is loaded
  useEffect(() => {
    if (quote) {
      // Set client from snapshot data
      setSelectedClient(quote.client_snapshot as Client);

      // Set form values from quote data
      methods.setValue(
        "discount_percentage",
        parseFloat(quote.discount || "0")
      );
      methods.setValue("tax_percentage", parseFloat(quote.tax_rate || "19"));
      if (quote.valid_until) {
        methods.setValue(
          "valid_until",
          new Date(quote.valid_until).toISOString().split("T")[0]
        );
      }

      // Convert quote products to SelectedProduct format
      const convertedProducts: SelectedProduct[] =
        quote.products_snapshot?.map((productItem: any, index: number) => {
          // Generate unique ID for each item to avoid conflicts
          const baseId = productItem.product_snapshot.variation_id
            ? Number(productItem.product_snapshot.variation_id)
            : productItem.product_snapshot.id;
          const uniqueId = baseId * 10000 + index; // Ensure uniqueness using index

          return {
            id: uniqueId,
            name: productItem.product_snapshot.name,
            price: productItem.price,
            quantity: productItem.quantity,
            tva: parseFloat(productItem.tax_rate) || 19,
            regular_price: productItem.product_snapshot.regular_price,
            stock_quantity: productItem.product_snapshot.stock_quantity,
            is_on_sale: !!productItem.product_snapshot.sale_price,
            images: productItem.product_snapshot.image
              ? [{ src: productItem.product_snapshot.image }]
              : [],
            // Include variation information if this is a variable product
            ...(productItem.product_snapshot.variation_id && {
              variation_id: productItem.product_snapshot.variation_id,
              parent_product_id: productItem.product_snapshot.id,
              variation_attributes:
                productItem.product_snapshot.variation_attributes || [],
            }),
          };
        }) || [];

      setSelectedProducts(convertedProducts);
    }
  }, [quote, methods]);

  const totals = calculateTotals(
    selectedProducts,
    methods as UseFormReturn<QuoteFormData>
  );

  const onSubmit = (data: QuoteFormData) => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Veuillez sélectionner au moins un produit");
      return;
    }

    if (!quote) {
      toast.error("Devis non trouvé");
      return;
    }

    const productsArray = selectedProducts.map((product) => ({
      product_id: product.parent_product_id || product.id, // Use parent ID for variants, regular ID for simple products
      quantity: product.quantity,
      price: product.price,
      name: product.name, // Include the display name (important for variations)
      tva: product.tva || 19,
      // Include variation data for variable products
      ...(product.variation_id && {
        variation_id: product.variation_id,
        variation_attributes: product.variation_attributes || [],
      }),
    }));

    updateQuote(
      {
        method: "quote:update",
        data: {
          id: quote.id,
          client_id: selectedClient.id,
          products: productsArray,
          discount: data.discount_percentage.toString(),
          discount_type: "percentage",
          tax_rate: data.tax_percentage.toString(),
          valid_until: data.valid_until
            ? new Date(data.valid_until).toISOString()
            : undefined,
        },
      },
      {
        onSuccess: (result: any) => {
          if (result.stockWarnings && result.stockWarnings.length > 0) {
            setStockWarnings(result.stockWarnings);
            toast.warning("Devis mis à jour avec des alertes de stock", {
              description: `${result.stockWarnings.length} produit(s) en rupture de stock`,
            });
          } else toast.success("Devis mis à jour avec succès");
          setTimeout(
            () =>
              navigate("/quotes", {
                state: { revalidate: true },
              }),
            500
          );
        },
        onError: (error: any) => {
          toast.error(`Erreur: ${error.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Chargement du devis...</div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">
          {error?.message || "Devis non trouvé"}
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen w-full">
      <FormProvider {...methods}>
        {/* Header */}
        <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/quotes")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                Modifier le devis #{quote.id.toString().padStart(4, "0")}
              </h1>
              <p className="text-sm text-gray-600">
                Client: {selectedClient?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/quotes")}>
              Annuler
            </Button>
            <Button
              onClick={methods.handleSubmit(onSubmit)}
              disabled={isPending || selectedProducts.length === 0}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isPending ? "Sauvegarde..." : "Sauvegarder"}</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 gap-6 flex flex-col-reverse xl:flex-row space-y-6 overflow-y-auto scrollbar">
          <div className="flex-1 flex flex-col space-y-6">
            <QuoteProductsSection
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              stockWarnings={stockWarnings}
              setStockWarnings={setStockWarnings}
            />
            <QuoteDiscountSection />
            <QuotePaymentSummary totals={totals} />
          </div>
          <QuoteClientSection
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />
        </div>
      </FormProvider>
    </main>
  );
}
