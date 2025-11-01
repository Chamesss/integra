import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PopUp from "@/components/ui/custom-ui/pop-up";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useMutation } from "@/hooks/useMutation";
import { Upload, X, User } from "lucide-react";
import SubmitButtons from "@/components/ui/misc/submit-buttons";
import { Employee } from "@electron/models";
import FormInput from "../ui/custom-ui/form-input";
import FormTextarea from "../ui/custom-ui/form-textarea";
import { CreateEmployeeDto } from "../../../electron/types/employee.types";
import {
  EmployeeContractType,
  EmployeeStatus,
} from "@/types/enums/employee-status.enum";
import { getInitials } from "@/utils/text-formatter";

interface EmployeeFormProps {
  isAdding: boolean | null;
  setIsAdding: React.Dispatch<React.SetStateAction<boolean | null>>;
  refetch?: () => void;
  mode?: "create" | "edit";
  employee?: Employee;
}

export default function EmployeeForm({
  isAdding,
  setIsAdding,
  refetch,
  mode = "create",
  employee,
}: EmployeeFormProps) {
  const { showToast } = useToastLoader();
  const [previewImage, setPreviewImage] = useState<string | null>(
    employee?.picture || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeDto>({
    defaultValues: {
      name: employee?.name || "",
      phone: employee?.phone || "",
      email: employee?.email || "",
      address: employee?.address || "",
      start_date: employee?.start_date || "",
      end_date: employee?.end_date || "",
      status: employee?.status || EmployeeStatus.Active,
      picture: employee?.picture || "",
      contract_type: employee?.contract_type || EmployeeContractType.TEMPORAIRE,
    },
  });

  const { mutate: saveEmployee } = useMutation<any, CreateEmployeeDto>();

  const script = {
    edit: {
      title: "Modifier l'employé",
      description:
        "Modifiez les informations de l'employé, puis cliquez sur 'Enregistrer' pour mettre à jour.",
      submit: "Enregistrer",
      loading: "Modification en cours...",
      toast_loading: "Modification de l'employé en cours...",
      toast_success: "Employé modifié avec succès.",
      toast_error: "Échec de la modification de l'employé.",
      method: "employee:update",
    },
    create: {
      title: "Ajouter un employé",
      description:
        "Entrez les informations de l'employé, puis cliquez sur 'Ajouter employé' pour l'enregistrer.",
      submit: "Ajouter employé",
      loading: "Ajout en cours...",
      toast_loading: "Ajout de l'employé en cours...",
      toast_success: "Employé ajouté avec succès.",
      toast_error: "Échec de l'ajout de l'employé.",
      method: "employee:create",
    },
  };

  // Reset preview image when employee prop changes
  useEffect(() => {
    setPreviewImage(employee?.picture || null);
  }, [employee, isAdding]);

  // Picture handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "L'image ne doit pas dépasser 5MB", {
          duration: 3000,
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        showToast("error", "Veuillez sélectionner une image valide", {
          duration: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setPreviewImage(base64String);
        setValue("picture", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setValue("picture", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const onSubmit = async (data: CreateEmployeeDto) => {
    const toastId = `${mode}-employee-toast`;
    showToast("loading", script[mode].toast_loading, {
      id: toastId,
      duration: Infinity,
    });

    const requestData = mode === "edit" ? { id: employee!.id, data } : data;

    saveEmployee(
      {
        method: script[mode].method,
        data: requestData,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", script[mode].toast_success, {
              id: toastId,
              duration: 3000,
            });
            refetch?.();
            reset();
            setIsAdding(false);
          } else {
            showToast("error", result.message || script[mode].toast_error, {
              id: toastId,
              duration: 3000,
            });
          }
        },
        onError: (error: any) =>
          showToast("error", error.message || script[mode].toast_error, {
            id: toastId,
            duration: 3000,
          }),
      }
    );
  };

  const handleCancel = () => {
    reset();
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsAdding(false);
  };

  return (
    <PopUp
      className="max-w-2xl overflow-auto"
      selected={isAdding}
      setSelected={setIsAdding}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="py-4 px-2.5">
        <h2 className="text-xl font-bold text-gray-900">
          {script[mode].title}
        </h2>
        <p className="text-sm text-gray-600 mt-6 mb-10">
          {script[mode].description}
        </p>

        <div className="space-y-8">
          {/* Picture Upload Section */}
          <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="flex flex-col items-center">
              <Label className="text-sm font-medium mb-2">
                Photo de profil
              </Label>

              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 cursor-pointer"
                    onClick={handleImageClick}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-300 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleImageClick}
                >
                  {watch("name") ? (
                    <span className="text-gray-600 font-medium text-lg">
                      {getInitials(watch("name"))}
                    </span>
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImageClick}
                  className="flex items-center space-x-1"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choisir une image</span>
                </Button>
                {previewImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <p className="text-xs text-gray-500 text-center mt-1">
                PNG, JPG jusqu'à 5MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <FormInput
                id="name"
                {...register("name", { required: "Le nom est requis" })}
                placeholder="Nom complet"
                error={errors.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <FormInput
                id="email"
                type="email"
                {...register("email", {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Format d'email invalide",
                  },
                })}
                placeholder="email@example.com"
                error={errors.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <FormInput
                id="phone"
                {...register("phone", {
                  pattern: {
                    value: /^[0-9+\-()\s]+$/,
                    message: "Numéro de téléphone invalide",
                  },
                })}
                onKeyDown={(e) => {
                  const allowed = /[0-9+\-()\s]/;
                  if (e.key.length === 1 && !allowed.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="Téléphone"
                type="tel"
                inputMode="tel"
                pattern="[0-9+\-()\s]*"
                className="w-full"
                error={errors.phone}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={watch("status")}
                onValueChange={(value: EmployeeStatus) =>
                  setValue("status", value)
                }
              >
                <SelectTrigger className="w-full !h-12 border-gray-300">
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent className="z-[99]">
                  <SelectItem value={EmployeeStatus.Active}>Actif</SelectItem>
                  <SelectItem value={EmployeeStatus.Inactive}>
                    Inactif
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début</Label>
              <FormInput
                id="start_date"
                type="date"
                {...register("start_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Date de fin</Label>
              <FormInput id="end_date" type="date" {...register("end_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_type">Type de contrat</Label>
              <Select
                value={watch("contract_type")}
                onValueChange={(value: EmployeeContractType) =>
                  setValue("contract_type", value)
                }
              >
                <SelectTrigger className="w-full !h-12 capitalize border-gray-300">
                  <SelectValue placeholder="Sélectionner le type de contrat" />
                </SelectTrigger>
                <SelectContent className="z-[99]">
                  {Object.values(EmployeeContractType).map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type[0].toLowerCase() === "c"
                        ? type
                        : type.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <FormTextarea
              id="address"
              {...register("address")}
              placeholder="Adresse complète"
              rows={3}
              error={errors.address}
            />
          </div>

          <SubmitButtons
            handleCancel={handleCancel}
            loading={isSubmitting}
            submitMsg={
              isSubmitting ? script[mode].loading : script[mode].submit
            }
          />
        </div>
      </form>
    </PopUp>
  );
}
