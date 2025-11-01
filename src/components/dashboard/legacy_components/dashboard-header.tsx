import SectionTitle from "@/components/ui/custom-ui/section-title";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <SectionTitle>Tableau de bord</SectionTitle>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de votre activité artisanale
        </p>
      </div>
    </div>
  );
}
