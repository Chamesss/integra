import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import FormInput from "../ui/custom-ui/form-input";
import Loading from "../ui/custom-ui/loading";
import { useFormAction } from "@/redux/contexts/form-action.context";
import { CreateTagDto } from "@electron/types/tag.types";
import { Tag } from "@electron/models";
import FormTextarea from "../ui/custom-ui/form-textarea";

interface Props {
  refetch?: () => void;
  setIsAddingTag?: (isAdding: boolean) => void;
}

export default function AddTagForm({ refetch, setIsAddingTag }: Props) {
  const { showToast } = useToastLoader();
  const { setIsOnAction } = useFormAction();
  const { mutate: createTag, isPending } = useMutation<CreateTagDto, Tag>();
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [newTag, setNewTag] = useState<CreateTagDto>({
    name: "",
    description: "",
  });

  const addTag = () => {
    // --- Validation Start ---
    if (!newTag.name.trim()) {
      setErrors({ name: "Le nom du tag ne peut pas être vide." });
      return;
    }
    setErrors({});
    // --- Validation End ---

    const toastId = `create-tag-toast`;

    showToast("loading", "Création du tag en cours...", {
      id: toastId,
      duration: Infinity,
    });
    setIsOnAction(true);

    createTag(
      {
        method: "tag:create",
        data: { ...newTag, name: newTag.name.trim() },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", "Tag créé avec succès", {
              id: toastId,
              duration: 3000,
            });
            refetch?.();
            setNewTag({ name: "", description: "" });
            setIsAddingTag?.(false);
          } else {
            showToast(
              "error",
              result.message || "La création du tag a échoué",
              {
                id: toastId,
                duration: 3000,
              }
            );
          }
          setIsOnAction(false);
        },
        onError: (error) => {
          showToast("error", error.message || "La création du tag a échoué", {
            id: toastId,
            duration: 3000,
          });
          setIsOnAction(false);
        },
      }
    );
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 relative">
        <Label htmlFor="tagName">Nom du tag</Label>
        <FormInput
          id="tagName"
          value={newTag.name}
          onChange={(e) => {
            setNewTag({ ...newTag, name: e.target.value });
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: undefined }));
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="ex: Nouveauté, Promotion"
          error={errors.name}
        />
      </div>

      <div className="space-y-4 relative">
        <Label htmlFor="tagDescription">Description du tag</Label>
        <FormTextarea
          id="tagDescription"
          value={newTag.description}
          onChange={(e) => {
            setNewTag({ ...newTag, description: e.target.value });
          }}
          onKeyDown={handleKeyDown}
          placeholder="Saisissez une description (optionnel)"
          rows={3}
        />
      </div>

      <Button
        type="button"
        onClick={addTag}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? (
          <Loading />
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter le tag
          </>
        )}
      </Button>
    </div>
  );
}
