import QuoteBulkDelete from "@/components/quotes/quote-bulk-delete";
import QuoteDeletePopup from "@/components/quotes/quote-delete-popup";
import QuoteFilter, { FilterValues } from "@/components/quotes/quote-filter";
import QuoteTableRow from "@/components/quotes/quote-table-row";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import SearchInputWithType from "@/components/ui/custom-ui/search-input-with-type";
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
import { Quote } from "@electron/types/quote.types";
import { ChevronDown, CirclePlus } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/ui/custom-ui/section-title";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import OfflineBanner from "@/components/ui/offline-banner";

export default function Quotes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isBulkDelete, setIsBulkDelete] = useState<boolean | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [status, setStatus] = useState<FilterValues>(undefined);
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
    searchType,
    setSearchType,
    refetch,
    setSortKey,
    setSortOrder,
    sortOrder,
  } = useFetchAll<Quote>({
    method: "quote:getAll",
    search_key: "ref",
    queryOptions: {
      refetchOnWindowFocus: false,
    },
    queryParams: {
      status,
    },
  });

  // Handle revalidation from navigation state
  useEffect(() => {
    const shouldRevalidate = location.state?.revalidate;
    if (shouldRevalidate) {
      refetch();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.revalidate, refetch, navigate, location.pathname]);

  const quotes = data?.rows || [];
  const totalQuotes = data?.count || 0;
  const totalPages = Math.ceil(totalQuotes / limit);

  const toggleSelectAll = () => {
    if (selected.size === quotes.length) setSelected(new Set());
    else setSelected(new Set(quotes.map((quote) => quote.id)));
  };

  const toggleSelectQuote = (quoteId: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(quoteId)) newSelected.delete(quoteId);
    else newSelected.add(quoteId);
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
      label: "Montant (Croissant)",
      sort_key: "ttc",
      sort_value: "asc",
    },
    {
      label: "Montant (Décroissant)",
      sort_key: "ttc",
      sort_value: "desc",
    },
    {
      label: "Statut (A-Z)",
      sort_key: "status",
      sort_value: "asc",
    },
    {
      label: "Statut (Z-A)",
      sort_key: "status",
      sort_value: "desc",
    },
  ];

  return (
    <main className="scrollbar flex flex-col h-screen justify-between w-full flex-1 gap-4 p-6">
      <OfflineBanner />
      <div className="flex items-center justify-between">
        <SectionTitle>Devis</SectionTitle>
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
            onClick={() => navigate("/quotes/new")}
            size="lg"
            disabled={!isOnline}
          >
            <span className="text-[0.8rem] md:text-sm">
              {isOnline ? "Créer devis" : "Créer devis (Hors ligne)"}
            </span>
            <CirclePlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex w-full bg-white overflow-auto border rounded-xl p-6 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchInputWithType
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
            refetch={refetch}
          />

          <div className="flex w-full flex-wrap justify-end gap-1 sm:gap-2">
            <div className="flex w-full flex-1 gap-2 md:gap-4">
              <QuoteFilter setStatus={setStatus} status={status} />
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
                      quotes.length > 0 && selected.size === quotes.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[3rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, index) => (
                  <TableSkeleton cols={7} checkbox key={index} />
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-red-500"
                  >
                    {error?.message ||
                      "Une erreur est survenue lors du chargement des devis."}
                  </TableCell>
                </TableRow>
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 opacity-60 text-center"
                  >
                    Aucun devis trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <QuoteTableRow
                    key={quote.id}
                    quote={quote}
                    selectedQuotes={selected}
                    toggleSelectQuote={toggleSelectQuote}
                    quotes={quotes}
                    refetch={refetch}
                    setIsDeleteMode={setIsDeleteMode}
                    setSelectedQuoteId={setSelectedQuoteId}
                    isOnline={isOnline}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <SearchPagination
          count={totalQuotes}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          totalPages={totalPages}
        />
      </div>

      <QuoteBulkDelete
        isBulkDeleteMode={isBulkDelete}
        setIsBulkDeleteMode={setIsBulkDelete}
        selectedQuotes={selected}
        setSelectedQuotes={setSelected}
        quotes={quotes}
        refetch={refetch}
      />

      <QuoteDeletePopup
        isDeleteMode={isDeleteMode}
        setIsDeleteMode={setIsDeleteMode}
        quoteId={selectedQuoteId}
        quotes={quotes}
        refetch={refetch}
      />
    </main>
  );
}
