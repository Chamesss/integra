import { Checkbox } from "@/components/ui/checkbox";
import SearchDropdownItem from "@/components/ui/custom-ui/search-dropdown-item";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Product } from "electron/models/product";
import ProductDeletePopup from "./product-delete-popup";
import { FormActionProvider } from "@/redux/contexts/form-action.context";
import ProductAddNew from "./product-form";

interface Props {
  product: Product;
  selectedProducts: Set<number>;
  toggleSelectProduct: (id: number) => void;
  products: Product[];
  refetch: () => void;
  isOnline?: boolean;
}

export default function ProductTableRow({
  product,
  selectedProducts,
  toggleSelectProduct,
  products,
  refetch, // refetch all products
}: Props) {
  const navigate = useNavigate();
  const [isDeleteMode, setIsDeleteMode] = useState<boolean | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean | null>(null);

  const handleProductClick = () => navigate(`/inventory/${product.id}`);
  return (
    <>
      <TableRow
        key={product.id}
        className={cn(
          "transition-all cursor-pointer hover:bg-gray-50",
          selectedProducts.has(product.id) &&
            "bg-blue-pale hover:bg-blue-pale/70"
        )}
        onClick={handleProductClick}
      >
        <TableCell className="pl-3 relative">
          <Checkbox
            checked={selectedProducts.has(product.id)}
            onCheckedChange={() => toggleSelectProduct(product.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${product.name}`}
          />
          {selectedProducts.has(product.id) && (
            <span className="absolute inset-0 w-1 bg-selected" />
          )}
        </TableCell>
        <TableCell title={product.name} className="max-w-[7rem] truncate">
          {product.name}
        </TableCell>
        <TableCell
          title={product.description || "Aucune description"}
          className="max-w-[25rem]"
        >
          <div
            className="max-h-[7rem] !h-fit overflow-auto scrollbar whitespace-pre-wrap"
            dangerouslySetInnerHTML={
              product.description
                ? { __html: product.description }
                : {
                    __html:
                      "<span class='italic opacity-60 font-normal'>Aucune description</span>",
                  }
            }
          />
        </TableCell>
        <TableCell className="max-w-[2rem]">
          {product.stock_quantity || (
            <span className="text-gray-500 text-xs">N/A</span>
          )}
        </TableCell>
        <TableCell>
          {dateToMonthDayYearTime(new Date(product.date_created || ""))}
        </TableCell>
        <TableCell className="w-[3rem]">
          <div onClick={(e) => e.stopPropagation()}>
            <SearchDropdownItem
              onDelete={() => setIsDeleteMode(true)}
              onEdit={() => setIsEditMode(true)}
            />
          </div>
        </TableCell>
      </TableRow>
      <ProductDeletePopup
        isDeleteMode={isDeleteMode}
        setIsDeleteMode={setIsDeleteMode}
        productId={product.id}
        products={products}
      />
      <FormActionProvider>
        <ProductAddNew
          isAdding={isEditMode}
          setIsAdding={setIsEditMode}
          refetch={refetch}
          mode="edit"
          product={product}
        />
      </FormActionProvider>
    </>
  );
}
