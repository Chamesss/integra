import { Calendar } from "lucide-react";

export default function DashboardHeader() {
  const currentMonth = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pb-4 sm:pb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Analytiques
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Vue d'ensemble détaillée de votre situation financière
        </p>
      </div>
      <div className="flex items-center text-sm capitalize bg-white py-2 px-3 font-semibold rounded-sm border gap-2 sm:gap-3">
        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">{currentMonth}</span>
        <span className="sm:hidden">
          {new Date().toLocaleDateString("fr-FR", { month: "short" })}
        </span>
      </div>
    </div>
  );
}
