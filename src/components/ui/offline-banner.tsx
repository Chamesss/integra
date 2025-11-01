import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
      <div className="flex items-center">
        <WifiOff className="h-5 w-5 text-orange-400 mr-3" />
        <div>
          <p className="text-sm text-orange-800">
            <strong>Mode hors ligne:</strong> Vous consultez les données
            locales. Les opérations de création, modification et suppression
            sont désactivées.
          </p>
        </div>
      </div>
    </div>
  );
}

export function NetworkStatusIndicator() {
  const isOnline = useNetworkStatus();

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">En ligne</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-orange-500" />
          <span className="text-orange-600">Hors ligne</span>
        </>
      )}
    </div>
  );
}
