import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../button";
import { useState, useMemo } from "react";

interface SortOption {
  label: string;
  sort_key: string;
  sort_value: string;
}

interface Props {
  extraOptions?: SortOption[];
  setSortKey: (key: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  sortOrder: "asc" | "desc";
  altDefaultSortKey?: string;
}

export default function SearchSort({
  extraOptions,
  setSortKey,
  setSortOrder,
  sortOrder,
  altDefaultSortKey,
}: Props) {
  const sortOptions = useMemo(
    () => [
      {
        label: "Date (décroissant)",
        sort_key: altDefaultSortKey || "createdAt",
        sort_value: "desc",
      },
      {
        label: "Date (croissant)",
        sort_key: altDefaultSortKey || "createdAt",
        sort_value: "asc",
      },

      ...(extraOptions || []),
    ],
    [extraOptions]
  );

  // Track selected option
  const [selected, setSelected] = useState(
    sortOptions.find((opt) => opt.sort_value === sortOrder) || sortOptions[0]
  );

  const handleSortChange = (sortKey: string, sortValue: string) => {
    const option = sortOptions.find(
      (opt) => opt.sort_key === sortKey && opt.sort_value === sortValue
    );
    if (option) setSelected(option);
    setSortKey(sortKey);
    setSortOrder(sortValue === "asc" ? "asc" : "desc");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex h-9 items-center gap-2 border px-2.5 shadow-none hover:bg-gray-pale md:h-10 md:px-4"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-[0.8rem] md:text-sm">{selected.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.sort_key + option.sort_value}
            onClick={() => handleSortChange(option.sort_key, option.sort_value)}
          >
            <span className="text-[0.8rem] md:text-sm">{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
