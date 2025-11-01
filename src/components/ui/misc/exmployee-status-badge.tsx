import { Badge } from "@/components/ui/badge";
import { EmployeeContractType } from "@/types/enums/employee-status.enum";

export const getEmployeeStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Actif
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Inactif
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200"
        >
          {status}
        </Badge>
      );
  }
};

export const getEmployeeContractTypeBadge = (
  contractType: EmployeeContractType
) => {
  switch (contractType) {
    case EmployeeContractType.CDI:
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          CDI
        </Badge>
      );
    case EmployeeContractType.CDD:
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          CDD
        </Badge>
      );
    case EmployeeContractType.CIVP:
      return (
        <Badge
          variant="outline"
          className="bg-indigo-50 text-indigo-700 border-indigo-200"
        >
          CIVP
        </Badge>
      );
    case EmployeeContractType.STAGE:
      return (
        <Badge
          variant="outline"
          className="bg-teal-50 text-teal-700 border-teal-200"
        >
          Stage
        </Badge>
      );
    case EmployeeContractType.FREELANCE:
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Freelance
        </Badge>
      );
    case EmployeeContractType.APPRENTISSAGE:
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Apprentissage
        </Badge>
      );
    case EmployeeContractType.TEMPORAIRE:
      return (
        <Badge
          variant="outline"
          className="bg-pink-50 text-pink-700 border-pink-200"
        >
          Temporaire
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200"
        >
          {contractType}
        </Badge>
      );
  }
};
