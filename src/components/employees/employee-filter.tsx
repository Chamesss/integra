import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

export type EmployeeFilterValues = "active" | "inactive" | undefined;

interface EmployeeFilterProps {
  status: EmployeeFilterValues;
  setStatus: (status: EmployeeFilterValues) => void;
}

export default function EmployeeFilter({
  status,
  setStatus,
}: EmployeeFilterProps) {
  const statusOptions = [
    { value: undefined, label: "Tous" },
    { value: "active" as const, label: "Actif" },
    { value: "inactive" as const, label: "Inactif" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <Filter className="h-4 w-4 mr-2" />
          <span className="mr-2">
            {status
              ? statusOptions.find((option) => option.value === status)?.label
              : "Filtrer"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.label}
            onClick={() => setStatus(option.value)}
            className={status === option.value ? "bg-accent" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
