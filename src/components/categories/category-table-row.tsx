import { Checkbox } from "@/components/ui/checkbox";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";
import { useState } from "react";
import CategoryDeletePopup from "./category-delete-popup";
import { Category } from "electron/models/category";
import CategoryAddNew from "./category-add-new";

interface Props {
  category: Category;
  selectedCategories: Set<number>;
  toggleSelectCategory: (id: number) => void;
  categories: Category[];
  refetch: () => void;
  isOnline?: boolean;
}

export default function CategoryTableRow({
  category,
  selectedCategories,
  toggleSelectCategory,
  categories,
  refetch,
}: Props) {
  const [isDeleteMode, setIsDeleteMode] = useState<boolean | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <TableRow
        key={category.id}
        className={cn(
          "cursor-pointe transition-all",
          selectedCategories.has(category.id) &&
            "bg-blue-pale hover:bg-blue-pale/70"
        )}
        onClick={() => setIsDrawerOpen(true)}
      >
        <TableCell className="pl-3 relative">
          <Checkbox
            checked={selectedCategories.has(category.id)}
            onCheckedChange={() => toggleSelectCategory(category.id)}
            aria-label={`Select ${category.name}`}
          />
          {selectedCategories.has(category.id) && (
            <span className="absolute inset-0 w-1 bg-selected" />
          )}
        </TableCell>
        <TableCell title={category.name} className="max-w-[7.5rem] truncate">
          {category.name}
        </TableCell>
        <TableCell
          title={category.description || "Aucune description"}
          className="max-w-[10rem] truncate"
        >
          {category.description || (
            <span className="opacity-50">Aucun description</span>
          )}
        </TableCell>
        <TableCell>{category.count}</TableCell>
        <TableCell>
          {category.createdAt
            ? dateToMonthDayYearTime(new Date(category.createdAt))
            : "N/A"}
        </TableCell>
        <TableCell className="w-[3rem]">
          <SearchDropdownItem
            onDelete={() => setIsDeleteMode(true)}
            onEdit={() => setIsEditMode(true)}
          />
        </TableCell>
      </TableRow>
      <CategoryDeletePopup
        isDeleteMode={isDeleteMode}
        setIsDeleteMode={setIsDeleteMode}
        categoryId={category.id}
        categories={categories}
        refetch={refetch}
      />
      <CategoryAddNew
        isAdding={isEditMode}
        setIsAdding={setIsEditMode}
        refetch={refetch}
        mode="edit"
        category={category}
      />

      {isDrawerOpen && null}
      {/* <UserInfo
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        setIsDrawerOpen={setIsDrawerOpen}
        isDrawerOpen={isDrawerOpen}
        title="User information"
      /> */}
    </>
  );
}
