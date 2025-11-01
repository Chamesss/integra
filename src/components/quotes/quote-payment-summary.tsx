import { formatAmountInWords, formatCurrency } from "@/utils/text-formatter";
import { Card } from "../ui/card";

interface QuoteTotals {
  subtotalHT: number;
  discountAmount: number;
  discountPercentage: number;
  subtotalAfterDiscount: number;
  tvaBreakdown: Record<number, { rate: number; base: number; amount: number }>;
  totalTvaAmount: number;
  total: number;
}

interface QuotePaymentSummaryProps {
  totals: QuoteTotals;
}

export default function QuotePaymentSummary({
  totals,
}: QuotePaymentSummaryProps) {
  const tvaRates = Object.values(totals.tvaBreakdown);

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-6">
        <h3 className="font-semibold">Détails de paiement</h3>

        <div className="space-y-3">
          <div className="text-sm font-medium">Taxe estimée</div>

          {/* TVA Breakdown Table */}
          <div className="bg-white border rounded-lg">
            <div className="grid grid-cols-3 gap-4 p-3 text-xs font-medium text-gray-500 border-b bg-gray-50">
              <span>TAUX</span>
              <span className="text-right">BASE TAXABLE</span>
              <span className="text-right">MONTANT TVA</span>
            </div>
            {tvaRates.map((tva) => (
              <div
                key={tva.rate}
                className="grid grid-cols-3 gap-4 p-3 border-b last:border-b-0"
              >
                <span className="text-sm font-medium">{tva.rate}%</span>
                <span className="text-sm text-right">
                  {formatCurrency(tva.base)}
                </span>
                <span className="text-sm text-right font-medium">
                  {formatCurrency(tva.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Total estimé</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">TOTAL H.T</span>
              <span className="font-medium">
                {formatCurrency(totals.subtotalHT)}
              </span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>REMISE ({totals.discountPercentage}%)</span>
                <span className="font-medium">
                  -{formatCurrency(totals.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>TOTAL TVA</span>
              <span className="font-medium">
                {formatCurrency(totals.totalTvaAmount)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>NET À PAYER</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Montant en lettres</div>
          <div className="text-xs text-gray-600">
            {formatAmountInWords(totals.total)}
          </div>
        </div>
      </div>
    </Card>
  );
}
