import { Search, X } from "lucide-react";
import { Input } from "../input";

interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refetch: () => void;
  prefix?: string;
}

export default function SearchInput({
  searchQuery,
  setSearchQuery,
  refetch,
  prefix,
}: Props) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <form onSubmit={handleSearch} className="relative md:w-[30rem]">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={prefix || "Rechercher..."}
        className="h-10 pl-8 text-[0.8rem] md:text-sm"
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
    </form>
  );
}
