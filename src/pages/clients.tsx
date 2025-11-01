import ClientAddNew from "@/components/clients/client-add-new";
import ClientBulkDelete from "@/components/clients/client-bulk-delete";
import ClientFilter, { FilterValues } from "@/components/clients/client-filter";
import ClientTableRow from "@/components/clients/client-table-row";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
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
import useFetchAll from "@/hooks/useFetchAll";
import { Client } from "electron/models/client";
import { ChevronDown, CirclePlus, ReceiptText, UserRound } from "lucide-react";
import { useState } from "react";

export default function Clients() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isBulkDelete, setIsBulkDelete] = useState<boolean | null>(null);
  const [isAdding, setIsAdding] = useState<boolean | null>(null);
  const [type, setType] = useState<FilterValues>(undefined);
  const {
    data,
    isLoading,
    error,
    limit,
    setLimit,
    setCurrentPage,
    searchType,
    setSearchType,
    currentPage,
    setSearchQuery,
    searchQuery,
    refetch,
    setSortKey,
    setSortOrder,
    sortOrder,
  } = useFetchAll<Client>({
    method: "client:getAll",
    search_key: "name",
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
    queryParams: {
      fields: {
        type,
      },
    },
  });

  const clients = data?.rows || [];
  const totalClients = data?.count || 0;
  const totalPages = Math.ceil(totalClients / limit);

  const toggleSelectAll = () => {
    if (selected.size === clients.length) setSelected(new Set());
    else setSelected(new Set(clients.map((client) => client.id)));
  };

  const toggleSelectClient = (clientId: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(clientId)) newSelected.delete(clientId);
    else newSelected.add(clientId);
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
      label: "Nom (A-Z)",
      sort_key: "name",
      sort_value: "asc",
    },
    {
      label: "Nom (Z-A)",
      sort_key: "name",
      sort_value: "desc",
    },
    {
      label: "Type (Entreprise/Particulier)",
      sort_key: "type",
      sort_value: "asc",
    },
    {
      label: "Type (Particulier/Entreprise)",
      sort_key: "type",
      sort_value: "desc",
    },
  ];

  const searchOptions = [
    {
      value: "name",
      label: "Client",
      icon: UserRound,
      placeholder: "Rechercher par client...",
    },
    {
      value: "tva",
      label: "TVA",
      icon: ReceiptText,
      placeholder: "Rechercher par TVA...",
    },
  ];

  return (
    <main className="scrollbar flex flex-col h-screen justify-between w-full flex-1 gap-4 p-6">
      <div className="flex items-center justify-between">
        <SectionTitle>Clients</SectionTitle>
        <div className="flex flex-row items-center gap-2">
          <SearchDropdownItem
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
          <Button onClick={() => setIsAdding(true)} size="lg">
            <span className="text-[0.8rem] md:text-sm">Ajouter client</span>
            <CirclePlus className="h-4 w-4" />
          </Button>
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
            searchOptions={searchOptions}
          />

          <div className="flex w-full flex-wrap justify-end gap-1 sm:gap-2">
            <div className="flex w-full flex-1 gap-2 md:gap-4">
              <ClientFilter setType={setType} type={type} />
              <SearchSort
                sortOrder={sortOrder}
                setSortKey={setSortKey}
                setSortOrder={setSortOrder}
                extraOptions={extraSortOptions}
              />
            </div>
          </div>
        </div>

        <div className="scrollbar w-full overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 py-3 pl-3">
                  <Checkbox
                    checked={
                      clients.length > 0 && selected.size === clients.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[3rem]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: limit }).map((_, index) => (
                  <TableSkeleton cols={6} checkbox key={index} />
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-red-500"
                  >
                    {error?.message ||
                      "Une erreur est survenue lors du chargement des clients."}
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 opacity-60 text-center"
                  >
                    Aucun client trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <ClientTableRow
                    key={client.id}
                    client={client}
                    selectedClients={selected}
                    toggleSelectClient={toggleSelectClient}
                    clients={clients}
                    refetch={refetch}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <SearchPagination
          count={totalClients}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          totalPages={totalPages}
        />
      </div>
      <ClientBulkDelete
        isBulkDeleteMode={isBulkDelete}
        setIsBulkDeleteMode={setIsBulkDelete}
        selectedClients={selected}
        setSelectedClients={setSelected}
        clients={clients}
        refetch={refetch}
      />
      <ClientAddNew
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        refetch={refetch}
      />
    </main>
  );
}
