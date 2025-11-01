import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@radix-ui/react-checkbox";

interface Props {
  cols: number;
  checkbox?: boolean;
}

export function TableSkeleton({ cols, checkbox }: Props) {
  return (
    <TableRow>
      {checkbox ? (
        <TableCell className="py-3 pl-3">
          <Checkbox disabled />
        </TableCell>
      ) : null}
      {Array.from({ length: cols }).map((_, index) => (
        <TableCell key={index}>
          <div className="h-4 animate-pulse rounded bg-gray-200" />
        </TableCell>
      ))}
    </TableRow>
  );
}
