import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Product } from "electron/models/product";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";
import InfoSection from "./info-section";

interface Props {
  product: Product;
}

export default function ProductPricing({ product }: Props) {
  const formatPrice = (price: string | undefined) => {
    if (!price || price === "0") return "N/A";
    return `${price} TND`;
  };

  const hasValidPrice = product.regular_price && product.regular_price !== "0";
  const hasValidSalePrice = product.sale_price && product.sale_price !== "0";
  const isOnSale = hasValidSalePrice && hasValidPrice;

  return (
    <InfoSection title="Tarification" icon={DollarSign} color="green">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-start flex-col gap-2">
            <span className="text-sm text-nowrap font-medium text-gray-600">
              Prix régulier
            </span>
            {!isOnSale && hasValidPrice && (
              <div className="px-2 py-1 bg-blue-50 text-nowrap text-blue-700 rounded-full text-xs font-medium">
                Prix actuel
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                isOnSale ? "text-gray-400 line-through" : "text-gray-900"
              }`}
            >
              {formatPrice(product.regular_price)}
            </span>
          </div>
        </div>

        {hasValidSalePrice && (
          <div className="space-y-2">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Prix de vente
              </span>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                En promotion
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-green-600">
                {formatPrice(product.sale_price)}
              </span>
              {isOnSale && (
                <span className="text-sm text-green-600 font-medium">
                  -
                  {Math.round(
                    ((parseFloat(product.regular_price) -
                      parseFloat(product.sale_price)) /
                      parseFloat(product.regular_price)) *
                      100
                  )}
                  %
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {(product.date_on_sale_from || product.date_on_sale_to) && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-800">
                Période de promotion
              </h4>
              <div className="text-sm text-amber-700 space-y-1">
                {product.date_on_sale_from && (
                  <div>
                    <span className="font-medium">Du:</span>{" "}
                    {dateToMonthDayYearTime(
                      new Date(product.date_on_sale_from)
                    )}
                  </div>
                )}
                {product.date_on_sale_to && (
                  <div>
                    <span className="font-medium">Au:</span>{" "}
                    {dateToMonthDayYearTime(new Date(product.date_on_sale_to))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </InfoSection>
  );
}
