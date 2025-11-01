import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Funnel } from "lucide-react";

export type FilterValues = "company" | "individual" | undefined;

interface Props {
  setType: (type: FilterValues) => void;
  type: FilterValues;
}

export default function ClientFilter({ setType, type }: Props) {
  const FilterOptions: { label: string; value: FilterValues }[] = [
    { label: "Tout", value: undefined },
    { label: "Entreprise", value: "company" },
    { label: "Particulier", value: "individual" },
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
            {type
              ? FilterOptions.find((option) => option.value === type)?.label
              : "Filtrer"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FilterOptions.map((option, index) => (
          <DropdownMenuItem key={index} onClick={() => setType(option.value)}>
            <span className="text-[0.8rem] md:text-sm">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
