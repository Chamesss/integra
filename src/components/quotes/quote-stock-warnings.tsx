import { StockWarning } from "@electron/types/quote.types";

interface QuoteStockWarningsProps {
  warnings: StockWarning[];
}

export default function QuoteStockWarnings({
  warnings,
}: QuoteStockWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="bg-orange-50 mt-2 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center gap-2 text-orange-800 font-medium mb-2">
        Alertes de stock
      </div>
      <div className="space-y-1">
        {warnings.map((warning) => (
          <div key={warning.product_id} className="text-sm text-orange-700">
            <strong>{warning.product_name}</strong>: Demandé{" "}
            {warning.requested_quantity}, disponible {warning.current_stock}{" "}
            (manque {warning.shortage})
          </div>
        ))}
      </div>
    </div>
  );
}
