import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import useFetchAll from "@/hooks/useFetchAll";
import { ChevronDown, CirclePlus, Mail, UserRound } from "lucide-react";

import EmployeeTableRow from "@/components/employees/employee-table-row";
import EmployeeForm from "@/components/employees/employee-form";
import EmployeeFilter, {
  EmployeeFilterValues,
} from "@/components/employees/employee-filter";
import EmployeeBulkDelete from "@/components/employees/employee-bulk-delete";
import SectionTitle from "@/components/ui/custom-ui/section-title";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import SearchSort from "@/components/ui/custom-ui/search-sort";
import SearchPagination from "@/components/ui/custom-ui/search-pagination";
import { Employee } from "@electron/models";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import SearchInputWithType from "@/components/ui/custom-ui/search-input-with-type";

export default function Employees() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isBulkDelete, setIsBulkDelete] = useState<boolean | null>(null);
  const [isAdding, setIsAdding] = useState<boolean | null>(null);
  const [status, setStatus] = useState<EmployeeFilterValues>(undefined);
  const {
    data,
    isLoading,
    error,
    limit,
    setLimit,
    setCurrentPage,
    currentPage,
    searchType,
    setSearchType,
    setSearchQuery,
    searchQuery,
    refetch,
    setSortKey,
    setSortOrder,
    sortOrder,
  } = useFetchAll<Employee>({
    method: "employee:getAll",
    search_key: "name",
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
    queryParams: {
      status,
    },
  });

  const employees = data?.rows || [];
  const totalEmployees = data?.count || 0;
  const totalPages = Math.ceil(totalEmployees / limit);

  const handleBulkAction = (action: string) => {
    if (action === "delete") {
      if (selected.size === 0) return;
      setIsBulkDelete(true);
      return;
    }
  };

  const toggleSelectAll = () => {
    if (selected.size === employees.length) setSelected(new Set());
    else setSelected(new Set(employees.map((employee) => employee.id)));
  };

  const toggleSelectEmployee = (categoryId: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(categoryId)) newSelected.delete(categoryId);
    else newSelected.add(categoryId);
    setSelected(newSelected);
  };

  const searchOptions = [
    {
      value: "name",
      label: "Client",
      icon: UserRound,
      placeholder: "Rechercher par client...",
    },
    {
      value: "email",
      label: "Email",
      icon: Mail,
      placeholder: "Rechercher par email...",
    },
  ];

  return (
    <main className="scrollbar flex flex-col h-screen justify-between w-full flex-1 gap-4 p-6">
      <div className="flex items-center justify-between">
        <SectionTitle>Employés</SectionTitle>
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
            <span className="text-[0.8rem] md:text-sm">Ajouter employé</span>
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
              <EmployeeFilter setStatus={setStatus} status={status} />
              <SearchSort
                sortOrder={sortOrder}
                setSortKey={setSortKey}
                setSortOrder={setSortOrder}
              />
            </div>
          </div>
        </div>

        <div className="scrollbar w-full overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      employees.length > 0 && selected.size === employees.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all employees"
                  />
                </TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de début</TableHead>
                <TableHead className="w-12"></TableHead>
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
              ) : employees.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="text-center py-8">
                    Aucun employé trouvé
                  </td>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <EmployeeTableRow
                    key={employee.id}
                    employee={employee}
                    selectedEmployees={selected}
                    toggleSelectEmployee={toggleSelectEmployee}
                    employees={employees}
                    refetch={refetch}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <SearchPagination
          count={totalEmployees}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          totalPages={totalPages}
        />
      </div>

      <EmployeeForm
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        refetch={refetch}
      />

      <EmployeeBulkDelete
        isBulkDeleteMode={isBulkDelete}
        setIsBulkDeleteMode={setIsBulkDelete}
        selectedEmployees={selected}
        setSelectedEmployees={setSelected}
        employees={employees}
        refetch={refetch}
      />
    </main>
  );
}
