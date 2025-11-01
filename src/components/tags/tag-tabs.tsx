import { CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Tag } from "@electron/models";
import { Controller, useFormContext } from "react-hook-form";
import { CreateProductDto } from "@electron/types/product.types";
import { useState } from "react";
import { useFormAction } from "@/redux/contexts/form-action.context";
import MultiSelect from "../ui/multi-select";
import TagCard from "./tag-card";
import PopUp from "../ui/custom-ui/pop-up";
import AddTagForm from "./tag-add-new";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { IResults } from "@electron/types/core.types";

interface Props {
  data?: IResults<Tag>;
  isLoading: boolean;
  refetchTags: () => void;
}

export default function TagsTabs({ data, isLoading, refetchTags }: Props) {
  const { control } = useFormContext<CreateProductDto>();
  const { isOnAction } = useFormAction();
  const [tagTab, setTagTab] = useState("existing");
  const [isAddingTag, setIsAddingTag] = useState<boolean | null>(null);

  return (
    <CardContent className="space-y-4">
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <Tabs value={tagTab} onValueChange={setTagTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger disabled={isOnAction} value="existing">
                Étiquettes prédéfinis
              </TabsTrigger>
              <TabsTrigger disabled={isOnAction} value="custom">
                Gestion des étiquettes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="predefinedAttribute">
                  Sélectionner un étiquette
                </Label>
                <div className="flex gap-2">
                  <MultiSelect
                    options={
                      data?.rows.map((attr) => ({
                        value: String(attr.id),
                        label: attr.name,
                      })) || []
                    }
                    value={field.value?.map((id) => String(id)) || []}
                    onChange={field.onChange}
                    isLoading={isLoading}
                    placeholder="Choisissez une étiquette"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="custom" className="mt-4">
              <div className="flex items-center gap-2 justify-between">
                <Label htmlFor="customTag">Liste des étiquettes</Label>
                <Button
                  type="button"
                  className="my-auto bg-black/90"
                  onClick={() => setIsAddingTag(true)}
                >
                  Ajouter une étiquette
                  <Plus className="w-4 h-4 text-white" />
                </Button>
                <PopUp
                  className="max-w-[25rem]"
                  selected={isAddingTag}
                  setSelected={setIsAddingTag}
                >
                  <AddTagForm
                    refetch={refetchTags}
                    setIsAddingTag={setIsAddingTag}
                  />
                </PopUp>
              </div>

              {data && data.rows.length === 0 ? (
                <p className="text-sm text-center my-2 text-muted-foreground">
                  Aucune étiquette personnalisée trouvée. Cliquez sur "Ajouter
                  une étiquette" pour en créer une.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez voir et gérer les étiquettes à partir d'ici.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {data?.rows?.map((tag) => (
                      <TagCard
                        key={tag.id}
                        tag={tag}
                        refetchTags={refetchTags}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      />
    </CardContent>
  );
}
