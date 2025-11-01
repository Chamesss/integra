import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatAmountInWords } from "@/utils/text-formatter";
import { formatDiscountText, hasDiscount } from "@/utils/discount-helpers";

interface TaxSummaryEntry {
  totalHt: number;
  totalRemise: number;
  totalTva: number;
}

interface Props {
  taxEntries: [string, TaxSummaryEntry][];
  ttc: string;
  discount?: string;
  discountType?: "percentage" | "fixed";
  taxSummary: Record<string, TaxSummaryEntry>;
  timbreFiscal?: string; // Only for invoices
}

export default function FinancialSummary({
  taxEntries,
  ttc,
  discount,
  discountType,
  taxSummary,
  timbreFiscal,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Détails de paiement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {/* TVA Breakdown Table */}
          <div>
            <div className="text-sm font-medium mb-3">Taxe estimée</div>
            <div className="bg-white border rounded-lg overflow-x-auto">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-3 text-xs font-medium text-gray-500 border-b bg-gray-50 min-w-full">
                <span>TAUX</span>
                <span className="text-right">BASE TAXABLE</span>
                <span className="text-right">MONTANT TVA</span>
              </div>
              {/* Display all tax rates from taxSummary */}
              {taxEntries.map(([taxRate, summary]) => (
                <div
                  key={taxRate}
                  className="grid grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-3 border-b last:border-b-0"
                >
                  <span className="text-xs sm:text-sm font-medium">
                    {taxRate}%
                  </span>
                  <span className="text-xs sm:text-sm text-right">
                    {formatCurrency(summary.totalHt - summary.totalRemise)}
                  </span>
                  <span className="text-xs sm:text-sm text-right font-medium">
                    {formatCurrency(summary.totalTva)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Total estimé</div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">TOTAL H.T</span>
                <span className="font-medium">
                  {formatCurrency(
                    Object.values(taxSummary).reduce(
                      (acc, curr) => acc + curr.totalHt,
                      0
                    )
                  )}
                </span>
              </div>

              {discount && hasDiscount(discount) ? (
                <div className="flex justify-between text-orange-600">
                  <span>
                    REMISE (
                    {formatDiscountText(discount, discountType || "percentage")}
                    )
                  </span>
                  <span className="font-medium">
                    -
                    {formatCurrency(
                      Object.values(taxSummary).reduce(
                        (acc, curr) => acc + curr.totalRemise,
                        0
                      )
                    )}
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between text-gray-600">
                <span>TOTAL TVA</span>
                <span className="font-medium">
                  {formatCurrency(
                    Object.values(taxSummary).reduce(
                      (acc, curr) => acc + curr.totalTva,
                      0
                    )
                  )}
                </span>
              </div>

              {timbreFiscal && (
                <div className="flex justify-between text-gray-600">
                  <span>TIMBRE FISCAL</span>
                  <span className="font-medium">
                    {formatCurrency(timbreFiscal)}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm sm:text-base pt-2 border-t">
                <span>NET À PAYER</span>
                <span>{formatCurrency(ttc)}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Montant en lettres</div>
            <div className="text-xs text-gray-600 break-words">
              {formatAmountInWords(parseFloat(ttc))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
