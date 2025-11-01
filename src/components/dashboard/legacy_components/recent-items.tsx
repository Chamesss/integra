import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Users,
  FileText,
  Receipt,
  ArrowRight,
  Eye,
} from "lucide-react";
import { Product } from "@electron/models/product";
import { Client } from "@electron/models/client";
import { Quote } from "@electron/types/quote.types";
import { formatCurrency } from "@/utils/text-formatter";
import { useNavigate } from "react-router";
import ClientIcon from "@/components/ui/client-icon";
import { Invoice } from "@/hooks/useInvoices";

interface RecentItemsProps {
  recentProducts: Product[];
  recentClients: Client[];
  recentQuotes: Quote[];
  recentInvoices: Invoice[];
}

const STATUS_COLORS = {
  quote: {
    active: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
    expired: "bg-amber-50 text-amber-700 border-amber-200",
  },
  invoice: {
    paid: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
  },
} as const;

const STATUS_LABELS = {
  quote: {
    active: "Actif",
    accepted: "Accepté",
    rejected: "Refusé",
    draft: "Brouillon",
    expired: "Expiré",
  },
  invoice: {
    paid: "Payée",
    pending: "En attente",
    overdue: "En retard",
    draft: "Brouillon",
    sent: "Envoyée",
  },
} as const;

type QuoteStatusKey = keyof typeof STATUS_COLORS.quote; // quote statuses
type InvoiceStatusKey = keyof typeof STATUS_COLORS.invoice; // invoice statuses
type StatusType = "quote" | "invoice";

interface SectionDefinition {
  key: "products" | "clients" | "quotes" | "invoices";
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bgColor: string;
  iconColor: string;
  route: string;
  emptyMessage: string;
}

const SECTIONS: SectionDefinition[] = [
  {
    key: "products",
    title: "Produits récents",
    icon: ShoppingBag,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    route: "/inventory",
    emptyMessage: "Aucun produit récent",
  },
  {
    key: "clients",
    title: "Clients récents",
    icon: Users,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    route: "/clients",
    emptyMessage: "Aucun client récent",
  },
  {
    key: "quotes",
    title: "Devis récents",
    icon: FileText,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    route: "/quotes",
    emptyMessage: "Aucun devis récent",
  },
  {
    key: "invoices",
    title: "Factures récentes",
    icon: Receipt,
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    route: "/invoices",
    emptyMessage: "Aucune facture récente",
  },
];

export default function RecentItems({
  recentProducts,
  recentClients,
  recentQuotes,
  recentInvoices,
}: RecentItemsProps) {
  const navigate = useNavigate();
  interface DataMap {
    products: Product[];
    clients: Client[];
    quotes: Quote[];
    invoices: Invoice[];
  }
  const data: DataMap = {
    products: recentProducts,
    clients: recentClients,
    quotes: recentQuotes,
    invoices: recentInvoices,
  };

  const getStatusColor = (
    status: QuoteStatusKey | InvoiceStatusKey,
    type: StatusType
  ): string => {
    const colors = STATUS_COLORS[type] as Record<string, string>;
    return colors[status] ?? "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const EmptyState = ({
    icon: Icon,
    message,
  }: {
    icon: React.ComponentType<any>;
    message: string;
  }) => (
    <div className="text-center py-6">
      <Icon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  );

  const ViewAllButton = ({ route }: { route: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-center text-xs h-8"
      onClick={() => navigate(route)}
    >
      Voir tout <ArrowRight className="h-3 w-3 ml-1" />
    </Button>
  );

  const ProductItem = ({ product }: { product: Product }) => (
    <div
      className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-md px-2 cursor-pointer transition-colors"
      onClick={() => navigate(`/inventory/${product.id}`)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].src || ""}
              alt={product.images[0].alt || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-row justify-between items-center min-w-0">
          <div className="w-full">
            <p className="text-sm line-clamp-1 font-medium text-gray-900">
              {product.name}
            </p>
            <p className="text-xs text-gray-500">
              Stock: {product.stock_quantity || 0}
            </p>
          </div>
          <Button variant="ghost" className="w-fit" size="sm">
            <Eye className="text-gray-400 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );

  const ClientItem = ({ client }: { client: Client }) => (
    <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-md px-2 cursor-pointer transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <ClientIcon type={client.type} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-gray-900">
            {client.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {client.phone || "Pas de contact"}
          </p>
        </div>
      </div>
    </div>
  );

  const DocumentItem = ({
    item,
    type,
  }: {
    item: Quote | Invoice;
    type: "quotes" | "invoices";
  }) => {
    const statusType: StatusType = type === "quotes" ? "quote" : "invoice";
    const amount = item.ttc;

    // Get translated status label
    const getStatusLabel = (status: string, type: StatusType): string => {
      const labels = STATUS_LABELS[type];
      return labels[status as keyof typeof labels] || status;
    };

    return (
      <div className="py-2 hover:bg-gray-50 rounded-md px-2 cursor-pointer transition-colors">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900">
            {type === "quotes" ? "Devis" : "Facture"} #{item.id}
          </p>
          <Badge
            className={`text-xs px-2 py-0.5 ${getStatusColor(
              item.status as QuoteStatusKey | InvoiceStatusKey,
              statusType
            )}`}
          >
            {getStatusLabel(item.status, statusType)}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
          <p className="text-xs font-medium text-gray-700">
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
    );
  };

  function renderContent<K extends SectionDefinition["key"]>(
    section: Extract<SectionDefinition, { key: K }>,
    items: DataMap[K]
  ) {
    if (!items || items.length === 0) {
      return <EmptyState icon={section.icon} message={section.emptyMessage} />;
    }
    return (
      <>
        <div className="space-y-2">
          {items.slice(0, 4).map((item) => {
            switch (section.key) {
              case "products":
                return (
                  <ProductItem
                    key={(item as Product).id}
                    product={item as Product}
                  />
                );
              case "clients":
                return (
                  <ClientItem
                    key={(item as Client).id}
                    client={item as Client}
                  />
                );
              case "quotes":
              case "invoices":
                return (
                  <DocumentItem
                    key={(item as Quote | Invoice).id}
                    item={item as Quote | Invoice}
                    type={section.key}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
        <ViewAllButton route={section.route} />
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      {SECTIONS.map((section) => (
        <Card key={section.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 ${section.bgColor} rounded-md`}>
                <section.icon className={`h-4 w-4 ${section.iconColor}`} />
              </div>
              <CardTitle className="text-sm font-medium">
                {section.title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 flex flex-col space-y-6 justify-between flex-1">
            {renderContent(section, data[section.key])}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
