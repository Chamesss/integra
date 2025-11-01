import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { User, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Client } from "electron/models/client";
import SelectionButton from "./client-type-selection";
import FormInput from "../ui/custom-ui/form-input";
import FormTextarea from "../ui/custom-ui/form-textarea";

interface ClientFormData {
  name: string;
  type: "individual" | "company";
  phone: string;
  address: string;
  tva?: string;
}

interface Props {
  isAdding: boolean | null;
  setIsAdding: (value: boolean | null) => void;
  refetch: () => void;
  mode?: "create" | "edit";
  client?: Client;
}

export default function ClientAddNew({
  isAdding,
  setIsAdding,
  refetch,
  mode = "create",
  client,
}: Props) {
  const { showToast } = useToastLoader(false);
  const { mutate: createClient, isPending } = useMutation();
  const [currentStep, setCurrentStep] = useState<"type" | "details">(
    mode === "edit" ? "details" : "type"
  );
  const [selectedType, setSelectedType] = useState<
    "individual" | "company" | null
  >(client?.type || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ClientFormData>({
    defaultValues: {
      name: client?.name || "",
      type: client?.type || "individual",
      phone: client?.phone || "",
      address: client?.address || "",
      tva: client?.tva || "",
    },
  });

  // Update form when client prop changes (for edit mode)
  useEffect(() => {
    if (client && mode === "edit") {
      setValue("name", client.name);
      setValue("type", client.type);
      setValue("phone", client.phone);
      setValue("address", client.address);
      setValue("tva", client.tva || "");
      setSelectedType(client.type);
      setCurrentStep("details");
    }
  }, [client, mode, setValue]);

  const script = {
    edit: {
      title: "Modifier le client",
      description:
        selectedType === "individual"
          ? "Modifiez les informations du client, son nom et prénom, son téléphone et l'adresse, puis cliquez sur 'Enregistrer' pour mettre à jour."
          : "Modifiez les informations du client, son nom, code TVA, son téléphone et l'adresse, puis cliquez sur 'Enregistrer' pour mettre à jour.",
      submit: "Enregistrer",
      loading: "Modification en cours...",
      toast_loading: "Modification du client en cours...",
      toast_success: "Client modifié avec succès.",
      toast_error: "Échec de la modification du client.",
      method: "client:update",
    },
    create: {
      title: "Ajouter un nouveau client",
      description:
        currentStep === "type"
          ? "Quel est le type de client?"
          : selectedType === "individual"
            ? "Entrez les informations de client, son nom et prénom, son téléphone et l'adresse, puis cliquez sur 'Ajouter client' pour l'enregistrer."
            : "Entrez les informations de client, son nom et prénom, code TVA, son téléphone et l'adresse, puis cliquez sur 'Ajouter client' pour l'enregistrer.",
      submit: "Ajouter client",
      loading: "Création...",
      toast_loading: "Création du client en cours...",
      toast_success: "Client créé avec succès.",
      toast_error: "Échec de la création du client.",
      method: "client:create",
    },
  };

  const onSubmit = (data: ClientFormData) => {
    const toastId = `${mode}-client-toast-${Date.now()}`;
    showToast("loading", script[mode].toast_loading, {
      id: toastId,
      duration: Infinity,
    });

    const clientData = {
      ...data,
      id: mode === "edit" ? client?.id : undefined,
      type: selectedType!,
      tva: data.tva?.trim() || null,
    };

    createClient(
      {
        method: script[mode].method,
        data: clientData,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", script[mode].toast_success, {
              id: toastId,
              duration: 3000,
            });
            reset();
            setCurrentStep(mode === "edit" ? "details" : "type");
            setSelectedType(mode === "edit" ? client?.type || null : null);
            setIsAdding(false);
            refetch();
          } else {
            showToast("error", result.message || script[mode].toast_error, {
              id: toastId,
              duration: 3000,
            });
          }
        },
        onError: (error) => {
          showToast("error", error.message || script[mode].toast_error, {
            id: toastId,
            duration: 3000,
          });
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    setCurrentStep(mode === "edit" ? "details" : "type");
    setSelectedType(mode === "edit" ? client?.type || null : null);
    setIsAdding(false);
  };

  const handleTypeSelection = (type: "individual" | "company") => {
    setSelectedType(type);
    setValue("type", type);
    setCurrentStep("details");
  };

  const handleBackToTypeSelection = () => {
    mode === "edit" ? setIsAdding(false) : setCurrentStep("type");
  };

  return (
    <Dialog open={!!isAdding} onOpenChange={() => handleClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[99vh] py-7 scrollbar overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle>{script[mode].title}</DialogTitle>
          <AnimatePresence mode="wait">
            {currentStep === "type" && mode === "create" ? (
              <motion.div
                key="type-selection"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DialogDescription>
                  {script[mode].description}
                </DialogDescription>
              </motion.div>
            ) : (
              <motion.div
                key="details-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DialogDescription>
                  {script[mode].description}
                </DialogDescription>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {currentStep === "type" && mode === "create" ? (
            <motion.div
              key="type-selection"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4 py-4">
                <SelectionButton
                  label="Particulier"
                  value="individual"
                  selected={selectedType}
                  onSelect={setSelectedType}
                  icon={<User className="w-6 h-6 text-blue-600" />}
                  selectedColor="blue"
                />
                <SelectionButton
                  label="Établissement"
                  value="company"
                  selected={selectedType}
                  onSelect={setSelectedType}
                  icon={<Building2 className="w-6 h-6 text-green-600" />}
                  selectedColor="green"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    selectedType && handleTypeSelection(selectedType)
                  }
                  disabled={!selectedType || isPending}
                >
                  Suivant
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="details-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {selectedType === "company"
                      ? "Nom de l'établissement"
                      : "Nom et prénom"}{" "}
                    *
                  </Label>
                  <FormInput
                    id="name"
                    {...register("name", { required: "Le nom est requis" })}
                    placeholder={
                      selectedType === "company"
                        ? "Nom de l'établissement"
                        : "Nom et prénom"
                    }
                    disabled={isPending}
                    error={errors.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tva">Code TVA *</Label>
                  <FormInput
                    id="tva"
                    {...register("tva", {
                      required:
                        selectedType === "company"
                          ? "Le code TVA est requis"
                          : false,
                    })}
                    placeholder="Code TVA"
                    disabled={isPending}
                    error={errors.tva}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <FormInput
                    id="phone"
                    {...register("phone", {
                      required: "Le téléphone est requis",
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
                    disabled={isPending}
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9+\-()\s]*"
                    className="w-full"
                    error={errors.phone}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <FormTextarea
                    id="address"
                    {...register("address", {
                      required: "L'adresse est requise",
                    })}
                    placeholder="Adresse"
                    disabled={isPending}
                    rows={3}
                    error={errors.address}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToTypeSelection}
                    disabled={isPending}
                  >
                    Retour
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? script[mode].loading : script[mode].submit}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
