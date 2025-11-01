import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { CreateProductDto } from "@electron/types/product.types";
import { fadeIn } from "../resources/defaultValue";
import FormInput from "@/components/ui/custom-ui/form-input";

export default function Shipping() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateProductDto>();

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
          <CardTitle>Informations sur l'expédition</CardTitle>
          <CardDescription>
            Configurez les paramètres d'expédition pour ce produit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Poids (kg)</Label>
            <FormInput
              id="weight"
              {...register("weight")}
              type="number"
              placeholder="Saisir le poids du produit"
              error={errors.weight}
            />
          </div>

          <div className="space-y-2">
            <Label>Dimensions (cm)</Label>
            <div className="grid grid-cols-3 gap-2">
              <FormInput
                {...register("dimensions.length")}
                type="number"
                placeholder="Longueur"
                error={errors.dimensions?.length}
              />
              <FormInput
                {...register("dimensions.width")}
                type="number"
                placeholder="Largeur"
                error={errors.dimensions?.width}
              />
              <FormInput
                {...register("dimensions.height")}
                type="number"
                placeholder="Hauteur"
                error={errors.dimensions?.height}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
