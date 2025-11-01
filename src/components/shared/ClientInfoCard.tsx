import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MapPin, Hash, Calendar, Euro } from "lucide-react";
import ClientIcon from "@/components/ui/client-icon";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";

interface ClientSnapshot {
  name: string;
  type: "individual" | "company";
  address?: string;
  phone?: string;
  tva?: string | null;
}

interface Props {
  clientSnapshot: ClientSnapshot;
  createdAt: string | Date;
  taxRate: string;
  notes?: string;
  additionalInfo?: {
    label: string;
    value: string;
  }[];
  documentType: "quote" | "invoice";
}

export default function ClientInfoCard({
  clientSnapshot,
  createdAt,
  taxRate,
  notes,
  additionalInfo = [],
  documentType,
}: Props) {
  return (
    <div className="w-full">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="flex items-center gap-3 pb-4 border-b w-full">
              <ClientIcon type={clientSnapshot.type} size="md" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 truncate">
                  {clientSnapshot.name}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {clientSnapshot.type === "individual"
                    ? "Particulier"
                    : "Établissement"}
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Client Details */}
          <div className="space-y-4">
            {/* TVA Code */}
            {clientSnapshot.tva && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Code TVA
                  </div>
                  <div className="font-medium text-gray-900 break-all">
                    {clientSnapshot.tva}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {clientSnapshot.phone && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Contact</div>
                <div className="flex items-center gap-2 text-sm text-gray-600 pl-4">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span className="break-all">{clientSnapshot.phone}</span>
                </div>
              </div>
            )}

            {/* Delivery Address */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                Adresse de livraison
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                <div className="text-sm text-gray-700 leading-relaxed break-words">
                  {clientSnapshot.address}
                </div>
              </div>
            </div>

            {/* Document Information */}
            <div className="space-y-3 pt-4 border-t">
              <div className="text-sm font-medium text-gray-700">
                Informations {documentType === "quote" ? "devis" : "facture"}
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Calendar className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {documentType === "quote" ? "Créé le" : "Créée le"}{" "}
                    {dateToMonthDayYearTime(
                      typeof createdAt === "string"
                        ? new Date(createdAt)
                        : createdAt
                    )}
                  </span>
                </div>

                {/* Additional info (like due date, valid until) */}
                {additionalInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Calendar className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span className="break-words">
                      {info.label}: {info.value}
                    </span>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <Euro className="w-3 h-3 flex-shrink-0" />
                  <span>TVA globale: {taxRate}%</span>
                </div>
              </div>

              {notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Notes:
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">
                    {notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
