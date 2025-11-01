import {
  Search,
  X,
  ChevronDown,
  Hash,
  UserRound,
  LucideIcon,
} from "lucide-react";
import { Input } from "../input";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: string;
  setSearchType: (type: string) => void;
  refetch: () => void;
  searchOptions?: Array<{
    value: string;
    label: string;
    icon: LucideIcon;
    placeholder: string;
  }>;
}

export default function SearchInputWithType({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  refetch,
  searchOptions,
}: Props) {
  const defaultOptions = searchOptions || [
    {
      value: "ref",
      label: "Référence",
      icon: Hash,
      placeholder: "Rechercher par référence...",
    },
    {
      value: "client_name",
      label: "Nom du client",
      icon: UserRound,
      placeholder: "Rechercher par client...",
    },
  ];

  const currentOption =
    defaultOptions.find((opt) => opt.value === searchType) || defaultOptions[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleSearchTypeChange = (newType: string) => {
    setSearchType(newType);
    setSearchQuery(""); // Clear search when changing type
  };

  return (
    <form onSubmit={handleSearch} className="relative md:w-[30rem] flex">
      {/* Search Type Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-3 rounded-r-none border-r-0 bg-muted/50 text-[0.8rem] md:text-sm whitespace-nowrap"
          >
            {currentOption.icon && <currentOption.icon className="h-4 w-4" />}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {defaultOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSearchTypeChange(option.value)}
            >
              {option.icon && <option.icon className="h-4 w-4 mr-2" />}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={currentOption.placeholder}
          className={cn(
            "h-10 pl-8 truncate text-xs md:text-sm rounded-l-none",
            searchQuery && "pr-6"
          )}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setSearchQuery("")}
            tabIndex={-1}
          >
            <X className="h-4 w-4 cursor-pointer hover:scale-105 active:scale-95 transition-all" />
          </button>
        )}
      </div>
    </form>
  );
}
