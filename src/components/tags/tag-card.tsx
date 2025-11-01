import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EllipsisVertical } from "lucide-react";
import { CreateProductDto } from "@electron/types/product.types";
import { Controller, useFormContext } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useFormAction } from "@/redux/contexts/form-action.context";
import { Tag } from "@electron/models";
import { useState } from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";

interface Props {
  tag: Tag;
  refetchTags?: () => void;
}

export default function TagCard({ tag, refetchTags }: Props) {
  const { control } = useFormContext<CreateProductDto>();
  const { setIsOnAction } = useFormAction();
  const [isDeletingTag, setIsDeletingTag] = useState<boolean | null>(null);
  const { showToast } = useToastLoader();
  const { mutate: deleteTag, isPending } = useMutation();

  const handleDelete = (selectedTag: Tag) => {
    if (!selectedTag) return;

    const toastId = `delete-tag-toast-${selectedTag.id}`;
    showToast("loading", "Suppression du tag en cours...", {
      id: toastId,
      duration: Infinity,
    });
    setIsOnAction(true);
    deleteTag(
      {
        method: "tag:delete",
        data: { id: selectedTag.id },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", "Tag supprimé avec succès", {
              id: toastId,
              duration: 3000,
            });
            refetchTags?.();
            setIsDeletingTag(false);
          } else {
            showToast(
              "error",
              result.message || "La suppression du tag a échoué",
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
            error.message || "La suppression du tag a échoué",
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
    <Card className="overflow-hidden p-0 gap-0">
      <CardHeader className="flex flex-row  items-center justify-between bg-gray-50 p-4 dark:bg-gray-800">
        <div>
          <CardTitle className="capitalize text-base font-semibold">
            {tag.name}
          </CardTitle>
          <CardDescription className="text-xs">
            {tag.count} produits associés
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* {attribute.variation && <Badge variant="outline">Variation</Badge>}
          {attribute.visible ? (
            <Badge className="bg-green-100 text-green-800 border border-green-200">
              Visible
            </Badge>
          ) : (
            <Badge variant="secondary">Invisible</Badge>
          )} */}
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
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500 focus:bg-red-50"
                onClick={() => setIsDeletingTag(true)}
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <PopUp
        className="max-w-[25rem]"
        selected={isDeletingTag}
        setSelected={setIsDeletingTag}
      >
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <DeleteContainer
              onDelete={() => {
                handleDelete(tag);
                field.onChange(field.value?.filter((id) => id !== tag.id));
              }}
              onClose={() => setIsDeletingTag(false)}
              label="Supprimer l'étiquette"
              loading={isPending}
            >
              <div className="space-y-4 text-center">
                Êtes-vous sûr de vouloir supprimer l'étiquette
                <strong> {tag.name} </strong> ?
                <p className="text-sm text-gray-500 mt-2">
                  Cette action est irréversible.
                </p>
              </div>
            </DeleteContainer>
          )}
        />
      </PopUp>
    </Card>
  );
}
