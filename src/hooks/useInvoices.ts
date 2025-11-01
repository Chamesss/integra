import { useAppSelector } from "@/redux/store";
import useFetchAll from "./useFetchAll";
import { useMutation } from "./useMutation";
import { useToastLoader } from "./useToasterLoader";
import { selectSettings } from "@/redux/slices/settings.slice";

export interface Invoice {
  id: number;
  ref: string;
  status: "draft" | "sent" | "paid" | "overdue";
  createdAt: string;
  due_date?: string | null;
  tht: string;
  ttc: string;
  discount: string;
  discount_type: "percentage" | "fixed";
  tax_rate: string;
  timbre_fiscal: string;
  notes?: string;
  client_snapshot: {
    name: string;
    type: "individual" | "company";
    address?: string;
    phone?: string;
    tva?: string;
  };
  products_snapshot: Array<{
    name: string;
    quantity: number;
    price: string;
    tax_rate: string;
    tht: string;
    ttc: string;
  }>;
  quote_id?: number;
}

interface UseInvoicesOptions {
  search?: string;
  status?: string;
  clientId?: number;
  page?: number;
  limit?: number;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const { search = "", status, clientId, page = 1, limit = 50 } = options;

  const queryParams = {
    search,
    page,
    limit,
    ...(status && { status }),
    ...(clientId && { client_id: clientId }),
  };

  const { data, isLoading, error, refetch } = useFetchAll<Invoice>({
    method: "invoice:getAll",
    search_key: "search",
    queryParams,
  });

  return {
    invoices: data?.rows || [],
    totalInvoices: data?.count || 0,
    isLoading,
    error,
    refetch,
  };
}

export function useCreateInvoiceFromQuote() {
  const { mutate, isPending } = useMutation();
  const { showToast } = useToastLoader(false);
  const settings = useAppSelector(selectSettings);

  const createFromQuote = (
    quoteId: number,
    additionalData?: any,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: any) => void;
    }
  ) => {
    const id = "create-invoice-from-quote-toast";
    showToast("loading", "Création de la facture en cours...", {
      id,
      duration: Infinity,
    });
    const dataWithSettings = {
      ...additionalData,
      timbre_fiscal: settings.fiscal_value || "1.000",
    };
    mutate(
      {
        method: "invoice:createFromQuote",
        data: { quoteId, additionalData: dataWithSettings },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast(
              "success",
              "Facture créée avec succès à partir du devis",
              {
                id,
                duration: 3000,
              }
            );
            options?.onSuccess?.(result);
          } else {
            showToast(
              "error",
              result.message || "Erreur lors de la création de la facture",
              {
                id,
                duration: 3000,
              }
            );
            options?.onError?.(result);
          }
        },
        onError: (error: any) => {
          showToast("error", "Erreur lors de la création de la facture", {
            id,
            duration: 3000,
          });
          options?.onError?.(error);
        },
      }
    );
  };

  return {
    createFromQuote,
    isCreating: isPending,
  };
}

export function useChangeInvoiceStatus() {
  const { mutate, isPending } = useMutation();
  const { showToast } = useToastLoader(false);

  const changeStatus = (
    invoiceId: number,
    newStatus: string,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: any) => void;
    }
  ) => {
    const id = "change-invoice-status-toast";
    showToast("loading", "Changement de statut en cours...", {
      id,
      duration: Infinity,
    });
    mutate(
      {
        method: "invoice:changeStatus",
        data: { id: invoiceId, status: newStatus },
      },
      {
        onSuccess: (result: any) => {
          if (result.success) {
            showToast("success", "Statut de la facture mis à jour", {
              id,
              duration: 3000,
            });
            options?.onSuccess?.(result);
          } else {
            showToast("error", "Erreur lors de la mise à jour du statut", {
              id,
              duration: 3000,
            });
            options?.onError?.(result);
          }
        },
        onError: (error: any) => {
          showToast("error", `Erreur lors de la mise à jour du statut`, {
            id,
            duration: 3000,
          });
          options?.onError?.(error);
        },
      }
    );
  };

  return {
    changeStatus,
    isChanging: isPending,
  };
}

export function useValidateStock() {
  const { mutate, isPending } = useMutation();
  const { showToast } = useToastLoader(false);

  const validateStock = (
    products: Array<{
      product_id: number;
      quantity: number;
      price?: string;
      tva?: number;
    }>,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: any) => void;
    }
  ) => {
    const id = "validate-stock-toast";
    showToast("loading", "Validation des stocks en cours...", {
      id,
      duration: Infinity,
    });
    mutate(
      {
        method: "invoice:validateStock",
        data: { products },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", "Stocks validés avec succès", {
              id,
              duration: 3000,
            });
            options?.onSuccess?.(result);
          } else {
            showToast("error", "Erreur lors de la validation des stocks", {
              id,
              duration: 3000,
            });
          }
        },
        onError: (error: any) => {
          showToast("error", "Erreur lors de la validation des stocks", {
            id,
            duration: 3000,
          });
          options?.onError?.(error);
        },
      }
    );
  };

  return {
    validateStock,
    isValidating: isPending,
  };
}
