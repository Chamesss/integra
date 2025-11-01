import ProductAddNew from "@/components/products/product-form";
import ProductBulkDelete from "@/components/products/product-bulk-delete";
import ProductTableRow from "@/components/products/product-table-row";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import SearchInput from "@/components/ui/custom-ui/search-input";
import SearchPagination from "@/components/ui/custom-ui/search-pagination";
import SearchSort from "@/components/ui/custom-ui/search-sort";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetchAll from "@/hooks/useFetchAll";
import { FormActionProvider } from "@/redux/contexts/form-action.context";
import { Product } from "electron/models/product";
import { ChevronDown, CirclePlus } from "lucide-react";
import { useState } from "react";
import SectionTitle from "@/components/ui/custom-ui/section-title";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import OfflineBanner from "@/components/ui/offline-banner";

export default function Inventory() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isBulkDelete, setIsBulkDelete] = useState<boolean | null>(null);
  const [isAdding, setIsAdding] = useState<boolean | null>(null);
  const isOnline = useNetworkStatus();
  const {
    data,
    isLoading,
    error,
    limit,
    setLimit,
    setCurrentPage,
    currentPage,
    setSearchQuery,
    searchQuery,
    refetch,
    setSortKey,
    setSortOrder,
    sortOrder,
  } = useFetchAll<Product>({
    method: "product:getAll",
    search_key: "name",
    queryOptions: {
      staleTime: 0,
    },
    queryParams: {
      sort_key: "date_created",
    },
  });

  const products = data?.rows || [];
  const totalCategories = data?.count || 0;
  const totalPages = Math.ceil(totalCategories / limit);

  const toggleSelectAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((product) => product.id)));
  };

  const toggleSelectCategory = (productId: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(productId)) newSelected.delete(productId);
    else newSelected.add(productId);
    setSelected(newSelected);
  };

  const handleBulkAction = (action: string) => {
    if (action === "delete") {
      if (selected.size === 0) return;
      setIsBulkDelete(true);
      return;
    }
  };

  const extraSortOptions = [
    {
      label: "Quantité (Croissant)",
      sort_key: "stock_quantity",
      sort_value: "asc",
    },
    {
      label: "Quantité (Décroissant)",
      sort_key: "stock_quantity",
      sort_value: "desc",
    },
  ];

  return (
    <main className="scrollbar flex flex-col h-screen justify-between w-full flex-1 gap-4 p-6">
      <OfflineBanner />
      <div className="flex items-center justify-between">
        <SectionTitle>Inventaire</SectionTitle>
        <div className="flex flex-row items-center gap-2">
          <SearchDropdownItem
            trigger={
              <Button
                size="lg"
                variant="outline"
                disabled={selected.size === 0 || !isOnline}
              >
                <span className="text-[0.8rem] md:text-sm">
                  Actions ({selected.size})
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
            onDelete={() => handleBulkAction("delete")}
          />
          <Button
            onClick={() => setIsAdding(true)}
            size="lg"
            disabled={!isOnline}
          >
            <span className="text-[0.8rem] md:text-sm">
              {isOnline ? "Ajouter produit" : "Ajouter produit (Hors ligne)"}
            </span>
            <CirclePlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex w-full bg-white overflow-auto border rounded-xl p-6 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchInput
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
            refetch={refetch}
            prefix="Rechercher produit..."
          />

          <div className="flex w-full flex-wrap justify-end gap-1 sm:gap-2">
            <div className="flex w-full flex-1 gap-2 md:gap-4">
              <SearchSort
                sortOrder={sortOrder}
                setSortKey={setSortKey}
                setSortOrder={setSortOrder}
                extraOptions={extraSortOptions}
                altDefaultSortKey="date_created"
              />
            </div>
          </div>
        </div>

        <div className="scrollbar w-full overflow-auto rounded-md border lg:w-[87.5vw] xl:w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-3 pl-3 w-12">
                  <Checkbox
                    checked={
                      products.length > 0 && selected.size === products.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Qte</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[3rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, index) => (
                  <TableSkeleton cols={4} checkbox key={index} />
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-red-500"
                  >
                    {error?.message ||
                      "Une erreur est survenue lors du chargement des produits."}
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 opacity-60 text-center"
                  >
                    Aucune produit trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    selectedProducts={selected}
                    toggleSelectProduct={toggleSelectCategory}
                    products={products}
                    refetch={refetch}
                    isOnline={isOnline}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <SearchPagination
          count={totalCategories}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          totalPages={totalPages}
        />
      </div>
      <ProductBulkDelete
        isBulkDeleteMode={isBulkDelete}
        setIsBulkDeleteMode={setIsBulkDelete}
        selectedProducts={selected}
        setSelectedProducts={setSelected}
        products={products}
      />
      <FormActionProvider>
        <ProductAddNew isAdding={isAdding} setIsAdding={setIsAdding} />
      </FormActionProvider>
    </main>
  );
}
