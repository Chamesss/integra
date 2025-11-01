import { Button } from "@/components/ui/button";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { Pen } from "lucide-react";
import { Attribute } from "@electron/models";
import { useFormAction } from "@/redux/contexts/form-action.context";
import { prepareTermsOperations, validateAttribute } from "../resources/schema";
import {
  BatchUpdateAttributeTermsDto,
  UpdateAttributeDto,
} from "@electron/types/attribute.types";
import { useMutation } from "@/hooks/useMutation";
import Loading from "@/components/ui/custom-ui/loading";
import { AttributeDto, AttributeErrorState } from "../resources/default-value";

interface Props {
  newAttribute: AttributeDto;
  setErrors: (e: AttributeErrorState) => void;
  refetch?: () => void;
  setIsAddingAttribute?: (value: boolean) => void;
  attribute?: Attribute;
}

export default function ModifyAttribute({
  newAttribute,
  setErrors,
  refetch,
  setIsAddingAttribute,
  attribute,
}: Props) {
  const { showToast } = useToastLoader();
  const { setIsOnAction, isOnAction } = useFormAction();

  const {
    mutateAsync: editTermsAttribute,
    isPending: isPendingTermsAttributeModification,
  } = useMutation<
    {
      attributeId: number;
      termsData: BatchUpdateAttributeTermsDto;
    },
    Attribute
  >();

  const {
    mutateAsync: editAttribute,
    isPending: isPendingAttributeModification,
  } = useMutation<UpdateAttributeDto, Attribute>();

  const handleEditAttribute = async () => {
    if (!attribute) return;
    if (!validateAttribute(newAttribute, setErrors)) return;

    const hasNameChanged = newAttribute.name.trim() !== attribute.name;
    const originalTerms = attribute.terms || [];
    const currentTerms = newAttribute.terms;

    // Prepare terms operations
    const termsOperations = prepareTermsOperations(originalTerms, currentTerms);
    const hasTermsChanged =
      termsOperations.create.length > 0 ||
      termsOperations.update.length > 0 ||
      termsOperations.delete.length > 0;

    if (!hasNameChanged && !hasTermsChanged) {
      showToast("success", "Aucune modification détectée", {
        duration: 2000,
      });
      return;
    }

    const toastId = `modify-attribute-toast`;
    showToast("loading", "Modification de l'attribut en cours...", {
      id: toastId,
      duration: Infinity,
    });
    setIsOnAction(true);

    try {
      // Handle attribute name change first if needed
      if (hasNameChanged) {
        const result = await editAttribute({
          method: "attribute:update",
          data: {
            id: attribute.id,
            name: newAttribute.name.trim(),
            type: newAttribute.type,
          },
        });

        if (!result.success) {
          throw new Error(
            result.message || "La modification de l'attribut a échoué"
          );
        }
      }

      // Handle terms update if needed
      if (hasTermsChanged) {
        const result = await editTermsAttribute({
          method: "attributeTerm:batchUpdate",
          data: { attributeId: attribute.id, termsData: termsOperations },
        });

        if (!result.success) {
          throw new Error(
            result.message || "La modification des termes a échoué"
          );
        }
      }

      // Success - both operations completed
      showToast("success", "Attribut modifié avec succès", {
        id: toastId,
        duration: 3000,
      });
      refetch?.();
      setIsAddingAttribute?.(false);
    } catch (error: any) {
      showToast(
        "error",
        error.message || "La modification de l'attribut a échoué",
        {
          id: toastId,
          duration: 3000,
        }
      );
    } finally {
      setIsOnAction(false);
    }
  };

  const isLoading =
    isPendingTermsAttributeModification ||
    isPendingAttributeModification ||
    isOnAction;

  return (
    <Button
      id="edit-attribute"
      type="button"
      onClick={handleEditAttribute}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Pen className="w-4 h-4 mr-2" />
          Modifier l'attribut
        </>
      )}
    </Button>
  );
}
