import { AttributeType } from "@electron/types/attribute.types";
import { Attribute } from "@electron/models/attribute";

export const getDefaultValue = (Attribute: Attribute | undefined) => ({
  name: Attribute?.name || "",
  type: (Attribute?.type || AttributeType.Select) as AttributeType | undefined,
  terms:
    Attribute?.terms?.map((term) => ({
      id: term.id,
      name: term.name || "",
      description: term.description || "",
    })) || [],
});

export type AttributeErrorState = {
  name?: string;
  terms?: string[];
};

export type AttributeDto = ReturnType<typeof getDefaultValue>;
