import { Eye, EyeOff, Package, Settings } from "lucide-react";
import { Variation } from "./types";

export const VariationCardStatsValues = (
  variations: Variation[],
  variationLength: number
) => {
  const activeVariations = variations.filter((v) => v.enabled !== false);
  const inactiveVariations = variations.filter((v) => v.enabled === false);
  return [
    {
      title: "Total",
      count: variations.length,
      Icon: Package,
      iconColor: "text-blue-600",
      textColor: "text-blue-900",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Actives",
      count: activeVariations.length,
      Icon: Eye,
      iconColor: "text-green-600",
      textColor: "text-green-900",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Inactives",
      count: inactiveVariations.length,
      Icon: EyeOff,
      iconColor: "text-gray-600",
      textColor: "text-gray-900",
      bgColor: "bg-white",
      borderColor: "border-gray-200",
    },
    {
      title: "Attributs",
      count: variationLength,
      Icon: Settings,
      iconColor: "text-purple-600",
      textColor: "text-purple-900",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];
};

export type VariationCardStatsType = ReturnType<
  typeof VariationCardStatsValues
>;
