import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";

export default function ProductNotFound() {
  const navigate = useNavigate();
  return (
    <main className="flex flex-col h-screen w-full">
      <div className="flex items-center justify-between p-6 border-b bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Produit introuvable</h1>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Produit introuvable
          </h3>
          <p className="text-gray-500 mb-6">
            Le produit demandé n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate("/inventory")}>
            Retour à l'inventaire
          </Button>
        </div>
      </div>
    </main>
  );
}
