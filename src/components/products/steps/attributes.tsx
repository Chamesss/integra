import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fadeIn } from "../resources/defaultValue";
import useFetchAll from "@/hooks/useFetchAll";
import { Attribute } from "@electron/models/attribute";
import AttributeTabs from "@/components/attributes/attribute-tabs";

export default function AttributesStep() {
  const { data, isLoading, refetch } = useFetchAll<Attribute>({
    method: "attribute:getAll",
    search_key: "name",
    fetcherLimit: 1000,
    queryOptions: {
      staleTime: 1000 * 60 * 5,
    },
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
          <CardTitle>Attributs du produit</CardTitle>
          <CardDescription>
            Définissez les attributs et leurs termes pour ce produit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AttributeTabs
            data={data}
            isLoading={isLoading}
            refetchAttributes={refetch}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
