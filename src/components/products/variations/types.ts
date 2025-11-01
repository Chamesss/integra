export interface AttributeConfig {
  id: number;
  name: string;
  terms: string[];
  selected: boolean;
  forVariation: boolean;
}

export interface Variation {
  id: string;
  attributes: {
    name?: string;
    id: number;
    option: string;
  }[];
  sku: string;
  regular_price: string;
  stock_quantity: number;
  enabled: boolean;
  image?: string;
}

export type WorkflowStep = "attributes" | "preview" | "confirm";
