import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CreateProductDto, ProductType } from "@electron/types/product.types";
import { Controller, useFormContext } from "react-hook-form";
import MultiSelect from "@/components/ui/multi-select";
import useFetchAll from "@/hooks/useFetchAll";
import { Category } from "@electron/models/category";
import { fadeIn } from "../resources/defaultValue";
import ImageReorder from "../product-image-reorder";
import FormInput from "@/components/ui/custom-ui/form-input";
import { Tag } from "@electron/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TagsTabs from "@/components/tags/tag-tabs";
import MinimalEditor from "@/components/ui/tiptap-editor";

export default function General() {
  const { register, control, formState } = useFormContext<CreateProductDto>();

  const { data: categories, isLoading: loadingCategories } =
    useFetchAll<Category>({
      method: "category:getAll",
      search_key: "name",
      fetcherLimit: 1000,
      uniqueKey: "products-categories",
    });

  const {
    data: tags,
    isLoading: loadingTags,
    refetch: refetchTags,
  } = useFetchAll<Tag>({
    method: "tag:getAll",
    search_key: "name",
    fetcherLimit: 1000,
    uniqueKey: "products-tags",
  });

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
    >
      <Card>
        <CardHeader>
          <CardTitle>Informations sur le produit</CardTitle>
          <CardDescription>
            Saisissez les détails de base de votre produit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="name">Nom du produit</Label>
              <FormInput
                id="name"
                {...register("name")}
                placeholder="Saisissez le nom du produit"
                error={formState.errors.name}
              />
            </div>
            <div className="flex flex-col gap-2 min-w-[12rem]">
              <Label htmlFor="type">Type du produit</Label>
              <Controller
                name="type"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} value={value}>
                    <SelectTrigger className="w-full !h-12 border-gray-300">
                      <SelectValue placeholder="Sélectionnez le type de produit" />
                    </SelectTrigger>
                    <SelectContent className="z-[99]">
                      {Object.keys(ProductType).map((key, i) => (
                        <SelectItem
                          value={ProductType[key as keyof typeof ProductType]}
                          key={i}
                          className="capitalize"
                        >
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <MinimalEditor name="description" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Description courte</Label>
            <MinimalEditor className="h-[80px]" name="short_description" />
          </div>

          <div className="space-y-2 grid grid-cols-1">
            <Label htmlFor="category">Catégorie</Label>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  value={field.value?.map((id) => String(id)) || []}
                  onChange={(value) => field.onChange(value)}
                  options={categories?.rows?.map((category) => ({
                    label: category.name,
                    value: category.id.toString(),
                  }))}
                  placeholder="Sélectionnez des catégories"
                  isLoading={loadingCategories}
                  error={formState.errors.categories?.message}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <CardTitle>Étiquettes de produit</CardTitle>
            <CardDescription>
              Ajoutez des étiquettes pour aider les clients à trouver votre
              produit
            </CardDescription>
          </div>
        </CardHeader>
        <TagsTabs
          data={tags}
          isLoading={loadingTags}
          refetchTags={refetchTags}
        />
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Images du produit</CardTitle>
          <CardDescription>
            Téléchargez et réorganisez les images de votre produit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="images"
            control={control}
            render={({ field: { value: images, onChange } }) => (
              <ImageReorder
                imageItems={images || []}
                setImageItems={onChange}
              />
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
