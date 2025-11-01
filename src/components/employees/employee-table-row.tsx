import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { Employee } from "@electron/models";
import SearchDropdownItem from "../ui/custom-ui/search-dropdown-item";
import EmployeeForm from "./employee-form";
import EmployeeDeletePopup from "./employee-delete-popup";
import EmployeeDetailsSheet from "./employee-details-sheet";
import { cn } from "@/lib/utils";
import { getEmployeeStatusBadge } from "../ui/misc/exmployee-status-badge";
import { getInitials } from "@/utils/text-formatter";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";

interface Props {
  employee: Employee;
  selectedEmployees: Set<number>;
  toggleSelectEmployee: (id: number) => void;
  employees: Employee[];
  refetch: () => void;
}

export default function EmployeeTableRow({
  employee,
  selectedEmployees,
  toggleSelectEmployee,
  employees,
  refetch,
}: Props) {
  const [isDeleteMode, setIsDeleteMode] = useState<boolean | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isSelected = selectedEmployees.has(employee.id);

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointe group transition-all",
          isSelected && "bg-blue-pale hover:bg-blue-pale/70"
        )}
      >
        <TableCell className="w-12 relative py-3 pl-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelectEmployee(employee.id)}
            aria-label={`Select ${employee.name}`}
          />
          {isSelected && <span className="absolute inset-0 w-1 bg-selected" />}
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-3">
            {employee.picture ? (
              <img
                src={employee.picture}
                alt={employee.name}
                className="h-8 w-8 shrink-0 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800 ${employee.picture ? "hidden" : ""}`}
            >
              {getInitials(employee.name)}
            </div>
            <div className="font-medium" title={employee.name}>
              {employee.name}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {employee.email || <span className="opacity-50 text-xs">-</span>}
        </TableCell>
        <TableCell>
          {employee.phone || <span className="opacity-50 text-xs">-</span>}
        </TableCell>
        <TableCell>{getEmployeeStatusBadge(employee.status)}</TableCell>
        <TableCell>{dateToMonthDayYearTime(employee.start_date)}</TableCell>
        <TableCell>
          <SearchDropdownItem
            onDelete={() => setIsDeleteMode(true)}
            onEdit={() => setIsEditMode(true)}
            onView={() => setIsDrawerOpen(true)}
          />
        </TableCell>
      </TableRow>
      <EmployeeDeletePopup
        isDeleteMode={isDeleteMode}
        setIsDeleteMode={setIsDeleteMode}
        employeeId={employee.id}
        employees={employees}
        refetch={refetch}
      />
      <EmployeeForm
        isAdding={isEditMode}
        setIsAdding={setIsEditMode}
        refetch={refetch}
        mode="edit"
        employee={employee}
      />
      <EmployeeDetailsSheet
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        employee={employee}
      />
    </>
  );
}
