import { CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Attribute } from "@electron/models";
import { Controller, useFormContext } from "react-hook-form";
import { CreateProductDto } from "@electron/types/product.types";
import { useState } from "react";
import { useFormAction } from "@/redux/contexts/form-action.context";
import MultiSelect from "../ui/multi-select";
import PopUp from "../ui/custom-ui/pop-up";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { IResults } from "@electron/types/core.types";
import AttributesCard from "./attributes-card";
import AddAttributeForm from "./attribute-add-new";

interface Props {
  data?: IResults<Attribute>;
  isLoading: boolean;
  refetchAttributes: () => void;
}

export default function AttributeTabs({
  data,
  isLoading,
  refetchAttributes,
}: Props) {
  const { control, setValue } = useFormContext<CreateProductDto>();
  const { isOnAction } = useFormAction();
  const [attributsTab, setAttributsTab] = useState("existing");
  const [isAddingAttribute, setIsAddingAttribute] = useState<boolean | null>(
    null
  );

  const addAttribute = (values: string[]) => {
    const attributes: Attribute[] = [];
    if (!values.length) setValue("attributes", []);
    values.forEach((value) => {
      const attribute =
        data?.rows.find((attr) => String(attr.id) === value) || [];
      attributes.push(attribute as Attribute);
      setValue(
        "attributes",
        attributes.map((attr) => ({
          id: attr.id,
          name: attr.name,
          variation: true,
          visible: true,
          options: attr.terms ? attr.terms.map((term) => term.name) : [],
        })) as CreateProductDto["attributes"]
      );
    });
  };

  return (
    <CardContent className="space-y-4 p-0">
      <Controller
        name="attributes"
        control={control}
        render={({ field }) => (
          <Tabs value={attributsTab} onValueChange={setAttributsTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger disabled={isOnAction} value="existing">
                Attributs prédéfinis
              </TabsTrigger>
              <TabsTrigger disabled={isOnAction} value="custom">
                Gestion des attributs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="predefinedAttribute">
                  Sélectionner des attributs
                </Label>
                <div className="flex gap-2">
                  <MultiSelect
                    options={
                      data?.rows.map((attr) => ({
                        value: String(attr.id),
                        label: attr.name,
                      })) || []
                    }
                    value={field.value?.map((attr) => String(attr.id)) || []}
                    onChange={addAttribute}
                    isLoading={isLoading}
                    placeholder="Choisissez des attributs"
                  />
                </div>
              </div>

              {/* Display selected attributes and their terms */}
              {field.value && field.value.length > 0 && (
                <div className="space-y-3 mt-4">
                  <Label className="text-sm font-medium">
                    Attributs sélectionnés et leurs termes
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {field.value.map((localAttribute, i) => {
                      const attribute = data?.rows.find(
                        (attr) => attr.id === Number(localAttribute.id)
                      );
                      if (!attribute) return null;

                      return (
                        <AttributesCard
                          key={i}
                          attribute={attribute}
                          canChangeVisibility
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="custom" className="mt-4">
              <div className="flex items-center gap-2 justify-between">
                <Label htmlFor="customTag">Liste des attributs</Label>
                <Button
                  type="button"
                  className="my-auto bg-black/90"
                  onClick={() => setIsAddingAttribute(true)}
                >
                  Ajouter un attribut
                  <Plus className="w-4 h-4 text-white" />
                </Button>
                <PopUp
                  className="max-w-[35rem]"
                  selected={isAddingAttribute}
                  setSelected={setIsAddingAttribute}
                >
                  <AddAttributeForm
                    setIsAddingAttribute={setIsAddingAttribute}
                    refetch={refetchAttributes}
                  />
                </PopUp>
              </div>

              {data && data.rows?.length === 0 ? (
                <p className="text-sm text-center my-2 text-muted-foreground">
                  Aucun attribut personnalisée trouvée. Cliquez sur "Ajouter un
                  attribut" pour en créer une.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez voir et gérer les attributs à partir d'ici.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {data?.rows?.map((attribute) => (
                      <AttributesCard
                        key={attribute.id}
                        attribute={attribute}
                        refetchAttributes={refetchAttributes}
                        canEdit
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
