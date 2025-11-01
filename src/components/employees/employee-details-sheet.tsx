import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  EditIcon,
  UserIcon,
} from "lucide-react";
import { Employee } from "@electron/models";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";
import {
  getEmployeeContractTypeBadge,
  getEmployeeStatusBadge,
} from "../ui/misc/exmployee-status-badge";
import { getInitials } from "@/utils/text-formatter";

interface EmployeeDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit?: (employee: Employee) => void;
}

export default function EmployeeDetailsSheet({
  isOpen,
  onClose,
  employee,
  onEdit,
}: EmployeeDetailsSheetProps) {
  if (!employee) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto scrollbar !max-w-lg">
        <SheetHeader>
          <div className="flex items-center mt-2 justify-between">
            <div className="flex items-center space-x-3">
              {employee.picture ? (
                <img
                  src={employee.picture}
                  alt={employee.name}
                  className="h-12 w-12 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium ${employee.picture ? "hidden" : ""}`}
              >
                {getInitials(employee.name)}
              </div>
              <div>
                <SheetTitle className="text-left">{employee.name}</SheetTitle>
                <SheetDescription className="text-left">
                  Détails de l'employé
                </SheetDescription>
              </div>
            </div>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(employee)}
                className="ml-auto"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* Status */}
          {employee.status && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Statut</span>
              {getEmployeeStatusBadge(employee.status)}
            </div>
          )}

          {employee.contract_type && (
            <div className="flex items-center -mt-2 justify-between">
              <span className="text-sm font-medium text-gray-500">
                Type de contrat
              </span>
              <span className="text-sm text-gray-600">
                {getEmployeeContractTypeBadge(employee.contract_type)}
              </span>
            </div>
          )}

          {/* Contact Information */}
          {(employee.email || employee.phone || employee.address) && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Informations de contact
                </h3>

                <div className="space-y-3 pl-6">
                  {employee.email && (
                    <div className="flex items-center space-x-3">
                      <MailIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {employee.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Téléphone</p>
                        <p className="text-sm text-gray-600">
                          {employee.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {employee.address && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Adresse</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {employee.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Employment Information */}
          {(employee.start_date || employee.end_date) && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Informations d'emploi
                </h3>

                <div className="space-y-3 pl-6">
                  {employee.start_date && (
                    <div>
                      <p className="text-sm font-medium">Date de début</p>
                      <p className="text-sm text-gray-600">
                        {dateToMonthDayYearTime(employee.start_date)}
                      </p>
                    </div>
                  )}

                  {employee.end_date && (
                    <div>
                      <p className="text-sm font-medium">Date de fin</p>
                      <p className="text-sm text-gray-600">
                        {dateToMonthDayYearTime(employee.end_date)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          {(employee.createdAt || employee.updatedAt) && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Métadonnées</h3>

                <div className="space-y-3 pl-6">
                  {employee.createdAt && (
                    <div>
                      <p className="text-sm font-medium">Créé le</p>
                      <p className="text-sm text-gray-600">
                        {dateToMonthDayYearTime(employee.createdAt)}
                      </p>
                    </div>
                  )}

                  {employee.updatedAt && (
                    <div>
                      <p className="text-sm font-medium">
                        Dernière modification
                      </p>
                      <p className="text-sm text-gray-600">
                        {dateToMonthDayYearTime(employee.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
