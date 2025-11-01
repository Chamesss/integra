import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import SearchInputWithType from "@/components/ui/custom-ui/search-input-with-type";
import SearchPagination from "@/components/ui/custom-ui/search-pagination";
import SearchSort from "@/components/ui/custom-ui/search-sort";
import SectionTitle from "@/components/ui/custom-ui/section-title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Invoice } from "@/hooks/useInvoices";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import useFetchAll from "@/hooks/useFetchAll";
import InvoiceTableRow from "@/components/invoices/invoice-table-row";
import InvoiceDetails from "@/components/invoices/invoice-details";
import InvoiceBulkDelete from "@/components/invoices/invoice-bulk-delete";
import InvoiceFilter, {
  FilterValues,
} from "@/components/invoices/invoice-filter";
import { useLocation } from "react-router";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Invoices() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [status, setStatus] = useState<FilterValues>(undefined);
  const location = useLocation();

  // Extra sort options for invoices
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
  } = useFetchAll<Invoice>({
    method: "invoice:getAll",
    search_key: "ref",
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
    queryParams: {
      status,
    },
  });

  useEffect(() => {
    refetch();
  }, [location.pathname]);

  const invoices = data?.rows || [];
  const totalInvoices = data?.count || 0;
  const totalPages = Math.ceil(totalInvoices / limit);

  const toggleSelectAll = () => {
    if (selected.size === invoices.length) setSelected(new Set());
    else setSelected(new Set(invoices.map((invoice) => invoice.id)));
  };

  const toggleSelectInvoice = (invoiceId: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(invoiceId)) newSelected.delete(invoiceId);
    else newSelected.add(invoiceId);
    setSelected(newSelected);
  };

  const handleBulkAction = (action: string) => {
    if (action === "delete") {
      if (selected.size === 0) return;
      setIsBulkDeleteOpen(true);
      return;
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };

  const handleBulkDeleteSuccess = () => {
    setSelected(new Set());
    refetch();
  };

  return (
    <>
      <main className="scrollbar flex flex-col h-screen justify-between w-full flex-1 gap-4 p-6">
        <div className="flex items-center justify-between">
          <SectionTitle>Factures</SectionTitle>
          <div className="flex flex-row items-center gap-2">
            <SearchDropdownItem
              disabled={selected.size === 0}
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  disabled={selected.size === 0}
                >
                  <span className="text-[0.8rem] md:text-sm">
                    Actions ({selected.size})
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              }
              onDelete={() => handleBulkAction("delete")}
            />
          </div>
        </div>
        <div className="flex w-full bg-white overflow-auto border rounded-xl p-6 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SearchInputWithType
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchType={searchType}
              setSearchType={setSearchType}
              refetch={refetch}
            />

            <div className="flex w-full flex-wrap justify-end gap-1 sm:gap-2">
              <div className="flex w-full flex-1 gap-2 md:gap-4">
                <InvoiceFilter setStatus={setStatus} status={status} />
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
                  <TableHead className="w-12 pl-3">
                    <Checkbox
                      checked={
                        invoices.length > 0 && selected.size === invoices.length
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all invoices"
                    />
                  </TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton cols={8} />
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-destructive"
                    >
                      {error?.message ||
                        "Une erreur est survenue lors du chargement des factures."}
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 opacity-60 text-center"
                    >
                      Aucune facture trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <InvoiceTableRow
                      key={invoice.id}
                      invoice={invoice}
                      selectedInvoices={selected}
                      toggleSelectInvoice={toggleSelectInvoice}
                      invoices={invoices}
                      refetch={refetch}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <SearchPagination
            count={totalInvoices}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            setLimit={setLimit}
            totalPages={totalPages}
          />
        </div>
      </main>

      {/* Invoice Details Dialog */}
      <InvoiceDetails
        invoice={selectedInvoice}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      {/* Bulk Delete Dialog */}
      <InvoiceBulkDelete
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedInvoices={selected}
        onSuccess={handleBulkDeleteSuccess}
        invoices={invoices}
      />
    </>
  );
}
