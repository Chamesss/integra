import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { Attribute } from "@electron/models/attribute";
import FormInput from "../ui/custom-ui/form-input";
import AddNewAttribute from "./actions/add-new-attribute";
import ModifyAttribute from "./actions/modify-attribute";
import {
  AttributeDto,
  AttributeErrorState,
  getDefaultValue,
} from "./resources/default-value";
import { useFormAction } from "@/redux/contexts/form-action.context";

interface Props {
  refetch?: () => void;
  setIsAddingAttribute?: (isAdding: boolean) => void;
  action?: "add" | "edit";
  attribute?: Attribute;
}

export default function AddAttributeForm({
  refetch,
  setIsAddingAttribute,
  action = "add",
  attribute,
}: Props) {
  const [errors, setErrors] = useState<AttributeErrorState>({});
  const { isOnAction } = useFormAction();
  const [newAttribute, setNewAttribute] = useState<AttributeDto>(
    getDefaultValue(attribute)
  );

  const addAttributeTerm = () => {
    setNewAttribute((prev) => ({
      ...prev,
      terms: [...prev.terms, { id: 0, name: "", description: "" }], // id: 0 for new terms
    }));
    setTimeout(() => {
      const newTermIndex = newAttribute.terms.length;
      const input = document.querySelector(
        `#attributeTerm-${newTermIndex}`
      ) as HTMLInputElement | null;
      if (input) input.focus();
    }, 100);
  };

  const removeAttributeTerm = (index: number) => {
    setNewAttribute((prev) => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index),
    }));

    // Also remove the corresponding error to keep the arrays in sync
    if (errors.terms && errors.terms[index]) {
      setErrors((prev) => {
        const newTermErrors = [...(prev.terms || [])];
        newTermErrors.splice(index, 1);
        return { ...prev, terms: newTermErrors };
      });
    }
  };

  const handleTermChange = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    setNewAttribute((prev) => {
      const newTerms = [...prev.terms];
      newTerms[index] = { ...newTerms[index], [field]: value };
      return { ...prev, terms: newTerms };
    });

    // Clear the error for this specific term as the user types
    if (errors.terms && errors.terms[index]) {
      setErrors((prev) => {
        const newTermErrors = [...(prev.terms || [])];
        newTermErrors[index] = "";
        return { ...prev, terms: newTermErrors };
      });
    }
  };

  const addCustomAttribute = () => {
    if (action === "add") {
      const button = document.querySelector(
        "#add-new-attribute"
      ) as HTMLButtonElement;
      button?.click();
    } else {
      const button = document.querySelector(
        "#edit-attribute"
      ) as HTMLButtonElement;
      button?.click();
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    action: "add" | "term" = "add"
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action === "add" ? addCustomAttribute() : addAttributeTerm();
    }
  };

  return (
    <div className="space-y-6">
      <Label className="text-lg">
        {action === "add"
          ? "Création d'une nouvelle attribut"
          : "Modifier l'attribut"}
      </Label>
      <div className="space-y-4 relative">
        <Label htmlFor="attributeName">Nom de l'attribut</Label>
        <FormInput
          id="attributeName"
          value={newAttribute.name}
          onChange={(e) => {
            setNewAttribute({ ...newAttribute, name: e.target.value });
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: undefined }));
            }
          }}
          placeholder="ex: Couleur, Taille, Matériau"
          error={errors.name}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="space-y-4">
        <Label>Termes de l'attribut</Label>
        <AnimatePresence>
          {newAttribute.terms.map((term, index) => (
            <motion.div
              key={index}
              className="flex gap-2 mb-6 relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <FormInput
                id={`attributeTerm-${index}`}
                placeholder="Saisir la valeur du terme"
                value={term.name}
                onChange={(e) =>
                  handleTermChange(index, "name", e.target.value)
                }
                error={errors.terms?.[index]}
                onKeyDown={(e) => handleKeyDown(e, "term")}
              />
              {newAttribute.terms.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttributeTerm(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAttributeTerm}
          className="w-full bg-transparent"
          disabled={isOnAction}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un terme
        </Button>
      </div>

      {action === "add" ? (
        <AddNewAttribute
          newAttribute={newAttribute}
          setNewAttribute={setNewAttribute}
          setErrors={setErrors}
          refetch={refetch}
          setIsAddingAttribute={setIsAddingAttribute}
        />
      ) : (
        <ModifyAttribute
          newAttribute={newAttribute}
          setErrors={setErrors}
          refetch={refetch}
          setIsAddingAttribute={setIsAddingAttribute}
          attribute={attribute}
        />
      )}
    </div>
  );
}
