import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Funnel } from "lucide-react";
import { InvoiceStatus } from "@electron/types/invoice.types";

export type FilterValues = InvoiceStatus | undefined;

interface Props {
  setStatus: (status: FilterValues) => void;
  status: FilterValues;
}

export default function InvoiceFilter({ setStatus, status }: Props) {
  const FilterOptions: { label: string; value: FilterValues }[] = [
    { label: "Tous", value: undefined },
    { label: "Brouillon", value: InvoiceStatus.Draft },
    { label: "Payée", value: InvoiceStatus.Paid },
    { label: "Envoyée", value: InvoiceStatus.Sent },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex h-9 items-center gap-2 border px-2.5 shadow-none hover:bg-gray-pale md:h-10 md:px-4"
        >
          <Funnel className="h-4 w-4" />
          <span className="text-[0.8rem] md:text-sm">
            {status
              ? FilterOptions.find((option) => option.value === status)?.label
              : "Filtrer"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FilterOptions.map((option, index) => (
          <DropdownMenuItem key={index} onClick={() => setStatus(option.value)}>
            <span className="text-[0.8rem] md:text-sm">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
