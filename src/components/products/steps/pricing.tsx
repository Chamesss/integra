import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateProductDto } from "electron/types/product.types";
import { motion } from "motion/react";
import { fadeIn } from "../resources/defaultValue";
import FormInput from "@/components/ui/custom-ui/form-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Pricing() {
  const { register, formState, watch } = useFormContext<CreateProductDto>();
  const productType = watch("type");

  // For variable products, show different UI
  if (productType === "variable") {
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
            <CardTitle>Prix du produit variable</CardTitle>
            <CardDescription>
              Les prix des produits variables sont définis au niveau des
              variantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4 mt-1" />
              <AlertDescription className="flex flex-col">
                <span>
                  Ce produit est de type <b className="w-fit">variable</b>.
                  <span className="block mt-1.5" />• Les prix sont gérés
                  individuellement pour chaque variante dans la section
                  "Variantes". Vous pouvez définir des prix différents pour
                  chaque combinaison d'attributs (taille, couleur, etc.).
                </span>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
          <CardTitle>Prix du produit</CardTitle>
          <CardDescription>
            Définissez le prix standard, le prix promotionnel et les dates de
            promotion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="regular_price">Prix normal</Label>
            <FormInput
              id="regular_price"
              type="number"
              step="0.1"
              {...register("regular_price")}
              placeholder="Prix normal du produit"
              error={formState.errors.regular_price}
              prefix="TND"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale_price">Prix promotionnel</Label>
            <FormInput
              id="sale_price"
              type="number"
              step="0.1"
              {...register("sale_price")}
              placeholder="Prix promotionnel du produit"
              error={formState.errors.sale_price}
              prefix="TND"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_on_sale_from">
              Date de début de promotion
            </Label>
            <FormInput
              id="date_on_sale_from"
              type="date"
              {...register("date_on_sale_from")}
              error={formState.errors.date_on_sale_from}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_on_sale_to">Date de fin de promotion</Label>
            <FormInput
              id="date_on_sale_to"
              type="date"
              {...register("date_on_sale_to")}
              error={formState.errors.date_on_sale_to}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
