import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { useMutation } from "@/hooks/useMutation";
import { Client } from "@electron/models/client";
import {
  CreateQuoteDto,
  Quote,
  QuoteFormData,
  QuoteStatus,
  SelectedProduct,
  StockWarning,
} from "@electron/types/quote.types";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import QuoteClientSection from "@/components/quotes/quote-client-section";
import QuoteProductsSection from "@/components/quotes/quote-product";
import QuoteDiscountSection from "@/components/quotes/quote-discount-section";
import QuotePaymentSummary from "@/components/quotes/quote-payment-summary";
import { calculateTotals } from "@/utils/product-price";

export default function QuoteNew() {
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

  const { mutate: createQuote, isPending } = useMutation<
    CreateQuoteDto,
    Quote,
    StockWarning
  >("stockWarnings");

  const onSubmit = (data: QuoteFormData) => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Veuillez sélectionner au moins un produit");
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

    createQuote(
      {
        method: "quote:create",
        data: {
          client_id: selectedClient.id,
          products: productsArray,
          discount: data.discount_percentage.toString(),
          discount_type: "percentage",
          tax_rate: data.tax_percentage.toString(),
          valid_until: data.valid_until
            ? new Date(data.valid_until).toISOString()
            : undefined,
          status: QuoteStatus.Draft,
        },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            if (result.stockWarnings && result.stockWarnings.length > 0) {
              setStockWarnings(result.stockWarnings);
              toast.warning("Devis créé avec des alertes de stock", {
                description: `${result.stockWarnings.length} produit(s) en rupture de stock`,
              });
            } else toast.success("Devis créé avec succès");
            setTimeout(
              () =>
                navigate("/quotes", {
                  state: { revalidate: true },
                }),
              500
            );
          } else toast.error("Erreur lors de la création du devis");
        },
        onError: (error: any) => {
          toast.error(`Erreur: ${error.message}`);
        },
      }
    );
  };

  const totals = calculateTotals(
    selectedProducts,
    methods as UseFormReturn<QuoteFormData>
  );

  return (
    <main className="flex flex-col h-screen w-full">
      <FormProvider {...methods}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/quotes")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Créer devis</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/quotes")}>
              Annuler
            </Button>
            <Button
              onClick={methods.handleSubmit(onSubmit)}
              disabled={isPending}
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 gap-6 mb-1 flex flex-col-reverse xl:flex-row overflow-y-auto scrollbar">
          <div className="flex-1 flex flex-col gap-6">
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
