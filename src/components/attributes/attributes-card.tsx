import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EllipsisVertical, Eye, EyeOff } from "lucide-react";
import { CreateProductDto } from "@electron/types/product.types";
import { useFormContext } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useFormAction } from "@/redux/contexts/form-action.context";
import { Attribute } from "@electron/models";
import { useState } from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "../ui/badge";
import AddAttributeForm from "./attribute-add-new";
import { cn } from "@/lib/utils";

interface Props {
  attribute: Attribute;
  refetchAttributes?: () => void;
  canEdit?: boolean;
  canChangeVisibility?: boolean;
}

export default function AttributeCard({
  attribute,
  refetchAttributes,
  canEdit = false,
  canChangeVisibility = false,
}: Props) {
  const { watch, setValue } = useFormContext<CreateProductDto>();
  const { setIsOnAction } = useFormAction();
  const [isDeletingAttribute, setIsDeletingAttribute] = useState<
    boolean | null
  >(null);
  const [isEditingAttribute, setIsEditingAttribute] = useState<boolean | null>(
    null
  );
  const { showToast } = useToastLoader();
  const { mutate: deleteTag, isPending } = useMutation();

  // Get current attribute visibility from form
  const currentAttributes = watch("attributes") || [];
  const currentAttribute = currentAttributes.find(
    (attr) => attr.id === attribute.id
  );
  const isVisible = currentAttribute?.visible ?? true;

  const toggleVisibility = () => {
    const updatedAttributes = (watch("attributes") || []).map((attr) =>
      attr.id === attribute.id ? { ...attr, visible: !attr.visible } : attr
    );
    setValue("attributes", updatedAttributes);
  };

  const removeAttribute = (attribute: Attribute) => {
    const currentAttributes = watch("attributes") || [];
    const updatedAttributes = currentAttributes.filter(
      (attr) => attr.id !== attribute.id
    );
    setValue("attributes", updatedAttributes);
  };

  const deleteAttribute = (attribute: Attribute) => {
    const toastId = "delete-attribute-toast";
    showToast("loading", "Suppression de l'attribut en cours...", {
      id: toastId,
      duration: Infinity,
    });
    setIsOnAction(true);
    deleteTag(
      { method: "attribute:delete", data: { id: attribute.id } },
      {
        onSuccess: (res) => {
          if (res.success) {
            removeAttribute(attribute);
            refetchAttributes?.();
            showToast("success", "Attribut supprimé avec succès.", {
              id: toastId,
              duration: 3000,
            });
          } else {
            showToast(
              "error",
              res.message || "Échec de la suppression de l'attribut.",
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
            error.message || "Erreur lors de la suppression de l'attribut.",
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

  return (
    <Card
      className={cn(
        "overflow-hidden p-0 gap-0 ",
        !isVisible && canChangeVisibility && "opacity-80"
      )}
    >
      <CardHeader className="flex flex-row  items-center justify-between bg-gray-50 p-4 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <CardTitle className="capitalize text-base font-semibold">
            {attribute.name}
          </CardTitle>
        </div>

        {canEdit ? (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingAttribute(true)}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 focus:bg-red-50"
                  onClick={() => setIsDeletingAttribute(true)}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : canChangeVisibility ? (
          <div className="flex items-center gap-2">
            {canChangeVisibility && (
              <Badge
                className={cn(
                  "flex items-center gap-1 rounded-4xl",
                  isVisible
                    ? "bg-emerald-100/50 border-green-300 text-emerald-900"
                    : "bg-gray-100 border-gray-300 text-gray-900"
                )}
              >
                {isVisible ? (
                  <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}
                <span className="text-xs">
                  {isVisible ? "Visible" : "Masqué"}
                </span>
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleVisibility}>
                  {isVisible ? (
                    <span className="text-xs flex flex-row items-center">
                      <EyeOff className="w-4 h-4 mr-2" />
                      Masquer l'attribut
                    </span>
                  ) : (
                    <span className="text-xs flex flex-row items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Afficher l'attribut
                    </span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-4">
        <h6 className="text-sm font-medium mb-2">Options</h6>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {attribute.terms?.map((term, termIndex) => (
              <motion.div
                key={`${term}-${termIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: termIndex * 0.05 }}
              >
                <Badge
                  className="flex items-center gap-2 text-sm font-normal"
                  variant="secondary"
                >
                  {term.name}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
      <PopUp
        className="max-w-[25rem]"
        selected={isDeletingAttribute}
        setSelected={setIsDeletingAttribute}
      >
        <DeleteContainer
          onDelete={() => deleteAttribute(attribute)}
          onClose={() => setIsDeletingAttribute(false)}
          label="Supprimer l'étiquette"
          loading={isPending}
        >
          <div className="space-y-4 text-center">
            Êtes-vous sûr de vouloir supprimer l'étiquette
            <strong> {attribute.name} </strong> ?
            <p className="text-sm text-gray-500 mt-2">
              Cette action est irréversible.
            </p>
          </div>
        </DeleteContainer>
      </PopUp>
      <PopUp
        className="max-w-[35rem]"
        selected={isEditingAttribute}
        setSelected={setIsEditingAttribute}
      >
        <AddAttributeForm
          setIsAddingAttribute={setIsEditingAttribute}
          refetch={refetchAttributes}
          attribute={attribute}
          action="edit"
        />
      </PopUp>
    </Card>
  );
}

interface CardProps {
  name: string;
  isVisible?: boolean;
  options?: string[];
}

export const ExtractedCard = ({ name, isVisible, options }: CardProps) => {
  return (
    <Card
      className={cn("overflow-hidden p-0 gap-0 ", !isVisible && "opacity-80")}
    >
      <CardHeader className="flex flex-row  items-center justify-between bg-gray-50 p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between w-full gap-2">
          <CardTitle className="capitalize text-base font-semibold">
            {name}
          </CardTitle>
          {isVisible ? (
            <Badge className="flex items-center gap-1 rounded-4xl bg-emerald-100/50 border-green-300 text-emerald-900">
              <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="text-xs">Visible</span>
            </Badge>
          ) : (
            <Badge className="flex items-center gap-1 rounded-4xl bg-gray-100 border-gray-300 text-gray-900">
              <EyeOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="text-xs">Masqué</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h6 className="text-sm font-medium mb-2">Options</h6>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {options?.map((term, termIndex) => (
              <motion.div
                key={`${term}-${termIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: termIndex * 0.05 }}
              >
                <Badge
                  className="flex items-center max-w-[15rem] w-full gap-2 text-sm font-normal"
                  variant="secondary"
                >
                  <span className="truncate">{term}</span>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};
