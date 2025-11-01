import CategoryAddNew from "@/components/categories/category-add-new";
import CategoryBulkDelete from "@/components/categories/category-bulk-delete";
import CategoryTableRow from "@/components/categories/category-table-row";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import SearchInput from "@/components/ui/custom-ui/search-input";
import SearchPagination from "@/components/ui/custom-ui/search-pagination";
import SearchSort from "@/components/ui/custom-ui/search-sort";
import SectionTitle from "@/components/ui/custom-ui/section-title";
import OfflineBanner from "@/components/ui/offline-banner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetchAll from "@/hooks/useFetchAll";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Category } from "electron/models/category";
import { ChevronDown, CirclePlus } from "lucide-react";
import { useState } from "react";

export default function Categories() {
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
  } = useFetchAll<Category>({
    method: "category:getAll",
    search_key: "name",
    queryOptions: {
      staleTime: 0,
    },
  });

  const categories = data?.rows || [];
  const totalCategories = data?.count || 0;
  const totalPages = Math.ceil(totalCategories / limit);

  const toggleSelectAll = () => {
    if (selected.size === categories.length) setSelected(new Set());
    else setSelected(new Set(categories.map((category) => category.id)));
  };

  const toggleSelectCategory = (categoryId: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(categoryId)) newSelected.delete(categoryId);
    else newSelected.add(categoryId);
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
      label: "Nombre de produits (Croissant)",
      sort_key: "count",
      sort_value: "asc",
    },
    {
      label: "Nombre de produits (Décroissant)",
      sort_key: "count",
      sort_value: "desc",
    },
  ];

  return (
    <main className="scrollbar flex flex-col h-screen justify-between w-full flex-1 gap-4 p-6">
      <OfflineBanner />
      <div className="flex items-center justify-between">
        <SectionTitle>Catégories</SectionTitle>
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
              {isOnline
                ? "Ajouter catégorie"
                : "Ajouter catégorie (Hors ligne)"}
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
            prefix="Rechercher catégorie..."
          />

          <div className="flex w-full flex-wrap justify-end gap-1 sm:gap-2">
            <div className="flex w-full flex-1 gap-2 md:gap-4">
              <SearchSort
                sortOrder={sortOrder}
                setSortKey={setSortKey}
                setSortOrder={setSortOrder}
                extraOptions={extraSortOptions}
              />
            </div>
          </div>
        </div>

        <div className="scrollbar w-full overflow-auto rounded-md border lg:w-[87.5vw] xl:w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 py-3 pl-3">
                  <Checkbox
                    checked={
                      categories.length > 0 &&
                      selected.size === categories.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Produits</TableHead>
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
                      "Une erreur est survenue lors du chargement des catégories."}
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 opacity-60 text-center"
                  >
                    Aucune catégorie trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <CategoryTableRow
                    key={category.id}
                    category={category}
                    selectedCategories={selected}
                    toggleSelectCategory={toggleSelectCategory}
                    categories={categories}
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
      <CategoryBulkDelete
        isBulkDeleteMode={isBulkDelete}
        setIsBulkDeleteMode={setIsBulkDelete}
        selectedCategories={selected}
        setSelectedCategories={setSelected}
        categories={categories}
        refetch={refetch}
      />
      <CategoryAddNew
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        refetch={refetch}
      />
    </main>
  );
}
