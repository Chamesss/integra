import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import Required from "../ui/misc/required";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { CreateCategoryDto } from "electron/types/category.types";
import { useMutation } from "@/hooks/useMutation";
import { Category } from "electron/models/category";
import SubmitButtons from "../ui/misc/submit-buttons";
import FormInput from "../ui/custom-ui/form-input";

interface Props {
  isAdding: boolean | null;
  setIsAdding: React.Dispatch<React.SetStateAction<boolean | null>>;
  refetch?: () => void;
  mode?: "create" | "edit";
  category?: Category;
}

export default function CategoryAddNew({
  isAdding,
  setIsAdding,
  refetch,
  mode = "create",
  category,
}: Props) {
  const { showToast } = useToastLoader();
  const { mutate: createCategory, isPending } = useMutation<
    CreateCategoryDto,
    Category
  >();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryDto>({
    defaultValues: {
      id: category?.id || 0,
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  const script = {
    edit: {
      title: "Modifier la catégorie",
      description:
        "Modifiez les informations de la catégorie, son nom et sa description, puis cliquez sur 'Enregistrer' pour mettre à jour.",
      submit: "Enregistrer",
      loading: "Modification en cours...",
      toast_loading: "Modification de la catégorie en cours...",
      toast_success: "Catégorie modifiée avec succès.",
      toast_error: "Échec de la modification de la catégorie.",
      method: "category:update",
    },
    create: {
      title: "Ajouter nouvelle catégorie",
      description:
        "Entrez les informations de la catégorie, son nom et sa description, puis cliquez sur 'Ajouter catégorie' pour l'enregistrer.",
      submit: "Ajouter catégorie",
      loading: "Ajout en cours...",
      toast_loading: "Ajout de la catégorie en cours...",
      toast_success: "Catégorie ajoutée avec succès.",
      toast_error: "Échec de l'ajout de la catégorie.",
      method: "category:create",
    },
  };

  const onSubmit = async (data: CreateCategoryDto) => {
    const toastId = `${mode}-category-toast`;
    showToast("loading", "Ajout de la catégorie en cours...", {
      id: toastId,
      duration: Infinity,
    });
    createCategory(
      {
        method: script[mode].method,
        data,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", script[mode].toast_loading, {
              id: toastId,
              duration: 3000,
            });
            refetch?.();
            reset();
            setIsAdding(false);
          } else {
            showToast("error", result.message || script[mode].toast_success, {
              id: toastId,
              duration: 3000,
            });
          }
        },
        onError: (error) => {
          showToast("error", error?.message || script[mode].toast_error, {
            id: toastId,
            duration: 3000,
          });
        },
      }
    );
  };

  const handleCancel = () => {
    reset();
    setIsAdding(false);
  };

  return (
    <PopUp
      className="max-w-xl overflow-auto"
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
          <div className="space-y-2.5 relative">
            <Label htmlFor="name">
              Nom de catégorie
              <Required />
            </Label>
            <FormInput
              id="name"
              type="text"
              {...register("name", {
                required: "Le nom de catégorie est requis",
                minLength: {
                  value: 2,
                  message: "Le nom doit contenir au moins 2 caractères",
                },
              })}
              placeholder="Bougies parfumées"
              error={errors.name}
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              {...register("description")}
              className="min-h-[10rem]"
              placeholder="Bougies coulées à la main à base de cire de soja naturelle, infusées d'huiles essentielles délicieuses comme la lavande, la vanille ou les agrumes."
            />
          </div>

          <SubmitButtons
            handleCancel={handleCancel}
            loading={isPending}
            submitMsg={isPending ? script[mode].loading : script[mode].submit}
          />
        </div>
      </form>
    </PopUp>
  );
}
