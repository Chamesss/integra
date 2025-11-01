import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/custom-ui/loading";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useFormAction } from "@/redux/contexts/form-action.context";
import { Attribute } from "@electron/models";
import { CreateAttributeWithTermsDto } from "@electron/types/attribute.types";
import { Plus } from "lucide-react";
import {
  AttributeDto,
  AttributeErrorState,
  getDefaultValue,
} from "../resources/default-value";
import { validateAttribute } from "../resources/schema";

interface Props {
  newAttribute: AttributeDto;
  setNewAttribute: (value: AttributeDto) => void;
  setErrors: (e: AttributeErrorState) => void;
  refetch?: () => void;
  setIsAddingAttribute?: (value: boolean) => void;
}

export default function AddNewAttribute({
  newAttribute,
  setNewAttribute,
  setErrors,
  refetch,
  setIsAddingAttribute,
}: Props) {
  const { showToast } = useToastLoader();
  const { setIsOnAction, isOnAction } = useFormAction();

  const { mutate: createAttribute, isPending } = useMutation<
    CreateAttributeWithTermsDto,
    Attribute
  >();

  const handleCreateAttribute = () => {
    if (!validateAttribute(newAttribute, setErrors)) return;

    const toastId = `create-attribute-toast`;
    const newAttributeTerms = {
      terms: newAttribute.terms.map((term) => ({
        name: term.name.trim(),
        description: term.description.trim(),
      })),
      name: newAttribute.name.trim(),
      type: newAttribute.type,
    };

    showToast("loading", "Création de l'attribut en cours...", {
      id: toastId,
      duration: Infinity,
    });
    setIsOnAction(true);

    createAttribute(
      {
        method: "attributeWithTerms:create",
        data: newAttributeTerms,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", "Attribut créé avec succès", {
              id: toastId,
              duration: 3000,
            });
            refetch?.();
            setNewAttribute(getDefaultValue(undefined));
            setIsAddingAttribute?.(false);
          } else {
            showToast(
              "error",
              result.message || "La création de l'attribut a échoué",
              {
                id: toastId,
                duration: 3000,
              }
            );
          }
          setIsOnAction(false);
        },
        onError: (error) => {
          showToast(
            "error",
            error.message || "La création de l'attribut a échoué",
            {
              id: toastId,
              duration: 3000,
            }
          );
          setIsOnAction(false);
        },
      }
    );
  };

  const isLoading = isPending || isOnAction;

  return (
    <Button
      id="add-new-attribute"
      type="button"
      onClick={handleCreateAttribute}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter l'attribut personnalisé
        </>
      )}
    </Button>
  );
}
