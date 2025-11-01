import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalPages: number;
  count?: number;
}

export default function SearchPagination({
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
  totalPages,
  count = 0,
}: Props) {
  // compute displayed item range (1-based). If no items, show 0 - 0
  const startIndex =
    count === 0 ? 0 : (Number(currentPage) - 1) * Number(limit) + 1;
  const endIndex = Math.min(Number(currentPage) * Number(limit), Number(count));

  return (
    <div className="flex flex-1 justify-end gap-4 flex-row items-end">
      <div className="flex flex-row items-center text-sm text-muted-foreground">
        <span className="xl:text-nowrap text-[0.7rem] lg:text-sm text-wrap">
          Afficher {startIndex} - {endIndex} sur {count}
        </span>
        <Select
          onValueChange={(value) => {
            setCurrentPage(1);
            setLimit(parseInt(value));
          }}
          defaultValue={limit.toString()}
        >
          <SelectTrigger size="sm" className="ml-2 text-black">
            <SelectValue placeholder="4" />
          </SelectTrigger>
          <SelectContent className="w-[4rem] min-w-0">
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="12">12</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className={cn("text-xs", {
                "pointer-events-none opacity-50": currentPage === 1,
              })}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(i + 1);
                }}
                size="sm"
                isActive={currentPage === i + 1}
              >
                <span className="text-nowrap !text-xs md:text-sm">{i + 1}</span>
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > 3 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(totalPages);
                  }}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              className={cn("text-xs", {
                "pointer-events-none opacity-50": currentPage === totalPages,
              })}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
