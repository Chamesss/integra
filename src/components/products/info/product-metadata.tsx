import { Calendar, Database, Link, Hash } from "lucide-react";
import { Product } from "electron/models/product";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";
import InfoSection from "./info-section";

interface Props {
  product: Product;
}

export default function ProductMetadata({ product }: Props) {
  return (
    <InfoSection icon={Database} title="Métadonnées" color="slate">
      <div className="space-y-6">
        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                Date de création
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-6">
              {dateToMonthDayYearTime(new Date(product.date_created))}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                Dernière modification
              </span>
            </div>
            <p className="text-sm text-gray-600 pl-6">
              {dateToMonthDayYearTime(new Date(product.date_modified))}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Informations techniques
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">ID</span>
              </div>
              <code className="text-xs bg-white px-2 py-1 rounded border">
                {product.id}
              </code>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Link className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Slug</span>
              </div>
              <code
                title={product.slug}
                className="text-xs bg-white px-2 py-1 rounded border max-w-48 truncate"
              >
                {product.slug}
              </code>
            </div>

            {product.permalink && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    Lien permanent
                  </span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <a
                    href={product.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:text-blue-800 break-all underline"
                  >
                    {product.permalink}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InfoSection>
  );
}
