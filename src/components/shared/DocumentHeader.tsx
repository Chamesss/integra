import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface Props {
  title: string;
  documentRef?: string;
  id: number;
  status: string;
  statusConfig: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      className?: string;
    }
  >;
  onDownloadPdf?: () => void;
}

export default function DocumentHeader({
  title,
  documentRef,
  id,
  status,
  statusConfig,
  onDownloadPdf,
}: Props) {
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <DialogHeader>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="truncate">
            {title} #{documentRef || id.toString().padStart(4, "0")}
          </span>
        </DialogTitle>
        <div className="flex items-center gap-3">
          {getStatusBadge(status)}
          {onDownloadPdf && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadPdf}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
          )}
        </div>
      </div>
    </DialogHeader>
  );
}
