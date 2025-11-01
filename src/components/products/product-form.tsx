import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import AttributesStep from "./steps/attributes";
import General from "./steps/general";
import PopUp from "../ui/custom-ui/pop-up";
import { Product } from "electron/models/product";
import Inventory from "./steps/inventory";
import Shipping from "./steps/shipping";
import Pricing from "./steps/pricing";
import { FormProvider, useForm } from "react-hook-form";
import { CreateProductDto, ProductStatus } from "@electron/types/product.types";
import {
  getProductDefaultValue,
  productStatusFields,
  slideIn,
  stepFields,
  steps,
} from "./resources/defaultValue";
import { useFormAction } from "@/redux/contexts/form-action.context";
import { resolver } from "./resources/resolver";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { convertBase64 } from "@/utils/base64";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  isAdding: boolean | null;
  setIsAdding: React.Dispatch<React.SetStateAction<boolean | null>>;
  refetch?: () => void;
  mode?: "create" | "edit";
  product?: Product;
}

export default function ProductAddNew({
  isAdding,
  setIsAdding,
  refetch,
  mode = "create",
  product,
}: Props) {
  const methods = useForm<CreateProductDto>({
    defaultValues: getProductDefaultValue(product),
    shouldUnregister: false,
    resolver,
  });

  const [currentStep, setCurrentStep] = useState("general");
  const { isOnAction, setIsOnAction } = useFormAction();
  const { mutate: addProduct } = useMutation();
  const { showToast } = useToastLoader(false);
  const status = methods.watch("status");
  const queryClient = useQueryClient();

  const renderStepContent = () => {
    switch (currentStep) {
      case "general":
        return <General />;
      case "pricing":
        return <Pricing />;
      case "inventory":
        return <Inventory />;
      case "shipping":
        return <Shipping />;
      case "attributes":
        return <AttributesStep />;
      default:
        return <General />;
    }
  };

  const onSubmit = async (data: CreateProductDto) => {
    const isEditMode = mode === "edit" && product?.id;
    const toastId = isEditMode ? "product-update-toast" : "product-add-toast";
    const loadingMessage = isEditMode
      ? "Mise à jour du produit en cours..."
      : "Ajout du produit en cours...";
    const successMessage = isEditMode
      ? "Produit mis à jour avec succès !"
      : "Produit ajouté avec succès !";
    const errorMessage = isEditMode
      ? "Échec de la mise à jour du produit"
      : "Échec de l'ajout du produit";

    setIsOnAction(false);
    showToast("loading", loadingMessage, {
      id: toastId,
      duration: Infinity,
    });

    const images = await Promise.all(
      (data.images ?? []).map(async (img) => {
        // Skip empty or invalid images
        if (!img) return null;

        // For existing images (no file property or file is null)
        if (!img.file || img.file === null) {
          // This is an existing image, preserve it
          return {
            file: null,
            filename: img.filename || "",
            preview: img.preview || "",
          };
        }

        // For new images with file data
        if (img.file instanceof File) {
          // Convert new file to base64
          const fileName = img.file.name || "image.jpg";
          const base64File = await convertBase64(img.file);
          return {
            filename: fileName,
            preview: img.preview,
            file: base64File,
          };
        }

        // For images that already have base64 data
        if (typeof img.file === "string") {
          return {
            filename: img.filename || "image.jpg",
            preview: img.preview,
            file: img.file,
          };
        }

        return null;
      })
    );

    data.images = images.filter((img) => img !== null);

    const submitData = isEditMode ? { ...data, id: product.id } : data;
    const method = isEditMode ? "product:update" : "product:create";

    addProduct(
      {
        method,
        data: submitData,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            showToast("success", successMessage, {
              duration: 3000,
              id: toastId,
            });
            if (!isEditMode) {
              methods.reset();
              setCurrentStep("general");
            }
            setIsAdding(false);

            queryClient.refetchQueries({
              queryKey: ["product:getAll"],
            });

            queryClient.refetchQueries({
              queryKey: ["category:getAll"],
            });

            refetch?.();
          } else
            showToast("error", res.message || errorMessage, {
              duration: 3000,
              id: toastId,
            });
        },
        onError: (error) => {
          showToast("error", error.message || errorMessage, {
            duration: 3000,
            id: toastId,
          });
        },
      }
    );
    setIsOnAction(false);
  };

  const handleInvalid = (errors: any) => {
    const errorFields = Object.keys(errors);
    for (const step of steps) {
      if (stepFields[step.id]?.some((field) => errorFields.includes(field))) {
        setCurrentStep(step.id);
        break;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") e.preventDefault();
  };

  return (
    <PopUp
      className="max-w-5xl overflow-hidden"
      selected={isAdding}
      setSelected={setIsAdding}
    >
      <div className="h-[87vh] flex flex-col">
        <div className="text-xl w-fit font-semibold mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "create"
              ? "Ajouter un nouveau produit"
              : "Modifier le produit"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {mode === "create"
              ? "Remplissez les détails pour créer un nouveau produit."
              : "Mettez à jour les détails du produit."}
          </p>
        </div>
        <div className="flex flex-row justify-between gap-2 flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[12rem] bg-white pr-2 border-gray-200 h-full">
            <nav>
              <ul className="space-y-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted =
                    steps.findIndex((s) => s.id === currentStep) > index;

                  return (
                    <li key={step.id}>
                      <button
                        disabled={isOnAction}
                        onClick={() => setCurrentStep(step.id)}
                        className={`w-full flex cursor-pointer items-center p-3 rounded-lg text-left transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 border border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                            isCompleted
                              ? "bg-green-100 text-green-600"
                              : isActive
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="font-medium flex-1 text-sm">
                          {step.title}
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-scroll overflow-x-hidden scrollbar pr-1 pt-1 pb-2">
              <FormProvider {...methods}>
                <form
                  onSubmit={methods.handleSubmit(onSubmit, handleInvalid)}
                  className="mx-auto"
                  autoComplete="off"
                  onKeyDown={handleKeyDown}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={slideIn}
                    >
                      {renderStepContent()}
                      <button className="hidden" type="submit" id="ccb-a" />
                    </motion.div>
                  </AnimatePresence>
                </form>
              </FormProvider>
            </div>

            {/* Navigation Buttons - Fixed at bottom */}
            <div className="border-t bg-white px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = steps.findIndex(
                        (step) => step.id === currentStep
                      );
                      if (currentIndex > 0) {
                        setCurrentStep(steps[currentIndex - 1].id);
                      }
                    }}
                    disabled={
                      steps.findIndex((step) => step.id === currentStep) ===
                        0 || isOnAction
                    }
                  >
                    Précédent
                  </Button>

                  <div className="flex gap-2">
                    {steps.findIndex((step) => step.id === currentStep) ===
                    steps.length - 1 ? (
                      <div className="flex">
                        <Button
                          // disabled={isOnAction}
                          className="rounded-r-none mx-0"
                          onClick={() => {
                            const button = document.getElementById("ccb-a");
                            if (button) button.click();
                          }}
                        >
                          {mode === "edit"
                            ? `Mettre à jour ${status === ProductStatus.Publish ? "et publier" : status === ProductStatus.Draft ? "comme brouillon" : status === ProductStatus.Private ? "comme privé" : ""}`
                            : productStatusFields[status as ProductStatus]}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            disabled={isOnAction}
                            className="mx-0"
                          >
                            <Button
                              disabled={isOnAction}
                              className="rounded-l-none mx-0 border-l border-gray-400"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                methods.setValue(
                                  "status",
                                  ProductStatus.Publish
                                )
                              }
                            >
                              {mode === "edit"
                                ? "Mettre à jour et publier"
                                : "Publier le produit"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                methods.setValue("status", ProductStatus.Draft)
                              }
                            >
                              {mode === "edit"
                                ? "Mettre à jour comme brouillon"
                                : "Enregistrer comme brouillon"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                methods.setValue(
                                  "status",
                                  ProductStatus.Private
                                )
                              }
                            >
                              {mode === "edit"
                                ? "Mettre à jour comme privé"
                                : "Enregistrer comme privée"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => {
                          const currentIndex = steps.findIndex(
                            (step) => step.id === currentStep
                          );
                          if (currentIndex < steps.length - 1) {
                            setCurrentStep(steps[currentIndex + 1].id);
                          }
                        }}
                      >
                        Suivant
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PopUp>
  );
}
