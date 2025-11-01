import { motion, AnimatePresence } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Controller, useFormContext } from "react-hook-form";
import {
  BackOrderStatus,
  CreateProductDto,
  StockStatus,
} from "@electron/types/product.types";
import { fadeIn } from "../resources/defaultValue";
import FormInput from "@/components/ui/custom-ui/form-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package } from "lucide-react";

export default function Inventory() {
  const { register, control, watch } = useFormContext<CreateProductDto>();
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
            <CardTitle>Inventaire du produit variable</CardTitle>
            <CardDescription>
              L'inventaire des produits variables est géré au niveau des
              variantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Package className="h-4 w-4 mt-1" />
              <AlertDescription className="flex flex-col">
                <span>
                  Ce produit est de type <b className="w-fit">variable</b>.
                  <span className="block mt-1.5" />• L'inventaire est géré
                  individuellement pour chaque variante dans la section
                  "Variantes". Vous pouvez définir des quantités en stock et des
                  paramètres de gestion différents pour chaque combinaison
                  d'attributs.
                </span>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // For simple products, show normal inventory management
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
          <CardTitle>Gestion de l'inventaire</CardTitle>
          <CardDescription>
            Gérez l'inventaire de vos produits et les niveaux de stock
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="manage_stock"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="manage_stock"
                    checked={value}
                    onCheckedChange={onChange}
                  />
                  <Label htmlFor="manageStock">
                    Gérer la quantité en stock
                  </Label>
                </div>
                <AnimatePresence>
                  {value ? (
                    <motion.div
                      className="space-y-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="stockQuantity">Quantité en stock</Label>
                      <FormInput
                        id="stockQuantity"
                        type="number"
                        step="1"
                        {...register("stock_quantity")}
                        placeholder="Saisir la quantité en stock"
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </>
            )}
          />
          <div className="flex flex-row mt-8">
            <div className="space-y-2 flex-1">
              <Label htmlFor="stockStatus">État du stock</Label>
              <Controller
                name="stock_status"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez l'état du stock" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value={StockStatus.InStock}>
                        En stock
                      </SelectItem>
                      <SelectItem value={StockStatus.OutOfStock}>
                        En rupture de stock
                      </SelectItem>
                      <SelectItem value={StockStatus.OnBackOrder}>
                        En précommande
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="backorders">Autoriser les précommandes</Label>
              <Controller
                name="backorders"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une option de précommande" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value={BackOrderStatus.No}>
                        Ne pas autoriser
                      </SelectItem>
                      <SelectItem value={BackOrderStatus.Notify}>
                        Autoriser, mais notifier le client
                      </SelectItem>
                      <SelectItem value={BackOrderStatus.Yes}>
                        Autoriser
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
