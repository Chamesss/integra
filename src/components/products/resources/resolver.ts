import { Resolver } from "react-hook-form";
import { CreateProductDto } from "@electron/types/product.types";

export const resolver: Resolver<CreateProductDto> = async (values) => {
  const errors: any = {};

  // Validation des champs obligatoires
  if (!values.name || values.name.trim() === "") {
    errors.name = {
      type: "required",
      message: "Le nom du produit est obligatoire",
    };
  }

  // if (!values.regular_price) {
  //   errors.regular_price = {
  //     type: "required",
  //     message: "Le prix normal est obligatoire",
  //   };
  // }

  if (values.regular_price && isNaN(parseFloat(values.regular_price))) {
    // Validation des prix
    errors.regular_price = {
      type: "pattern",
      message: "Le prix normal doit être un nombre valide",
    };
  }

  if (values.sale_price && isNaN(parseFloat(values.sale_price))) {
    errors.sale_price = {
      type: "pattern",
      message: "Le prix de vente doit être un nombre valide",
    };
  }

  // Le prix de vente ne doit pas être supérieur au prix normal
  if (
    values.regular_price &&
    values.sale_price &&
    parseFloat(values.sale_price) > parseFloat(values.regular_price)
  ) {
    errors.sale_price = {
      type: "validate",
      message: "Le prix de vente ne peut pas être supérieur au prix normal",
    };
  }

  // Validation des dates
  if (values.date_on_sale_from && values.date_on_sale_to) {
    const fromDate = new Date(values.date_on_sale_from);
    const toDate = new Date(values.date_on_sale_to);

    if (fromDate >= toDate) {
      errors.date_on_sale_to = {
        type: "validate",
        message:
          "La date de fin de promotion doit être postérieure à la date de début",
      };
    }
  }

  // Validation de la quantité en stock
  if (
    values.manage_stock &&
    values.stock_quantity &&
    values.stock_quantity < 0
  ) {
    errors.stock_quantity = {
      type: "min",
      message: "La quantité en stock ne peut pas être négative",
    };
  }

  // Validation du poids
  if (values.weight && isNaN(parseFloat(values.weight))) {
    errors.weight = {
      type: "pattern",
      message: "Le poids doit être un nombre valide",
    };
  }

  // Validation des dimensions
  if (values.dimensions) {
    if (
      values.dimensions.length &&
      isNaN(parseFloat(values.dimensions.length))
    ) {
      errors.dimensions = {
        ...errors.dimensions,
        length: {
          type: "pattern",
          message: "La longueur doit être un nombre valide",
        },
      };
    }

    if (values.dimensions.width && isNaN(parseFloat(values.dimensions.width))) {
      errors.dimensions = {
        ...errors.dimensions,
        width: {
          type: "pattern",
          message: "La largeur doit être un nombre valide",
        },
      };
    }

    if (
      values.dimensions.height &&
      isNaN(parseFloat(values.dimensions.height))
    ) {
      errors.dimensions = {
        ...errors.dimensions,
        height: {
          type: "pattern",
          message: "La hauteur doit être un nombre valide",
        },
      };
    }
  }

  // Validation du SKU (devrait être unique, mais on ne peut pas le vérifier ici sans données externes)
  if (values.sku && values.sku.length > 100) {
    errors.sku = {
      type: "maxLength",
      message: "Le SKU ne peut pas dépasser 100 caractères",
    };
  }

  // Validation des catégories
  if (!values.categories || values.categories.length === 0) {
    errors.categories = {
      type: "required",
      message: "Au moins une catégorie est obligatoire",
    };
  }

  // Retour du résultat de validation
  return {
    values: Object.keys(errors).length === 0 ? values : {},
    errors: Object.keys(errors).length > 0 ? errors : {},
  };
};
