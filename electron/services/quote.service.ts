import { CoreService } from "./core.service";
import { Quote } from "../models/quote";
import { Product } from "../models/product";
import { Client } from "../models/client";
import { QuoteRepo } from "../repositories/quote.repo";
import { IResult, IResults, QueryParams } from "../types/core.types";
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteQueryDto,
  StockWarning,
  QuoteStatus,
} from "../types/quote.types";
import { logger } from "../utils/logger";
import { HttpException } from "../utils/http-exception";
import { WooCommerceService } from "../api/woocommerce.service";
import { Op } from "sequelize";

export class QuoteService extends CoreService<
  Quote,
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteQueryDto
> {
  private wooCommerceService: WooCommerceService;

  constructor(repo: QuoteRepo) {
    super(repo);
    this.wooCommerceService = new WooCommerceService();
  }

  async create(
    data: CreateQuoteDto
  ): Promise<IResult<Quote> & { stockWarnings?: StockWarning[] }> {
    try {
      // Fetch client data for snapshot
      const client = await Client.findByPk(data.client_id);
      if (!client) {
        return {
          success: false,
          message: "Client non trouvé",
        };
      }

      // Fetch products and check stock
      const stockWarnings: StockWarning[] = [];
      const productsWithSnapshots = [];
      let totalTHT = 0;

      for (const productData of data.products) {
        const product = await Product.findByPk(productData.product_id);
        if (!product) {
          return {
            success: false,
            message: `Produit avec l'ID ${productData.product_id} non trouvé`,
          };
        }

        // Check stock availability based on product type
        let currentStock = 0;
        let productName = product.name;
        const requestedQuantity = productData.quantity;

        if (productData.variation_id) {
          // This is a variation - need to get variation-specific stock
          try {
            // For variations, we fetch from WooCommerce API
            const variationResult =
              await this.wooCommerceService.getProductVariation(
                product.id,
                parseInt(productData.variation_id)
              );

            if (variationResult) {
              currentStock = variationResult.stock_quantity || 0;
              // Create better name for variation
              if (
                variationResult.attributes &&
                variationResult.attributes.length > 0
              ) {
                const attributeValues = variationResult.attributes
                  .map((attr: any) => attr.option)
                  .join(", ");
                productName = `${product.name} - ${attributeValues}`;
              }
            } else {
              logger.warn(
                `Variation ${productData.variation_id} not found, using parent product stock`
              );
              currentStock = product.stock_quantity || 0;
            }
          } catch (error) {
            logger.error(
              `Error fetching variation stock for ${productData.variation_id}:`,
              error
            );
            // Fallback to parent product stock
            currentStock = product.stock_quantity || 0;
          }
        } else {
          // This is a simple product - use local stock
          currentStock = product.stock_quantity || 0;
        }

        // Create stock warning if insufficient stock
        if (currentStock < requestedQuantity) {
          stockWarnings.push({
            product_id: productData.variation_id
              ? parseInt(productData.variation_id)
              : product.id,
            product_name: productData.name || productName,
            requested_quantity: requestedQuantity,
            current_stock: currentStock,
            shortage: requestedQuantity - currentStock,
          });
        }

        // Calculate prices
        const unitPrice = productData.price
          ? parseFloat(productData.price)
          : parseFloat(product.price || product.regular_price);
        const lineTotal = unitPrice * requestedQuantity;
        // Use product-specific tax rate if provided, otherwise use global tax rate
        const taxRate = productData.tva || parseFloat(data.tax_rate || "19");
        const lineTotalWithTax = lineTotal * (1 + taxRate / 100);

        totalTHT += lineTotal;

        // Create product snapshot
        // Use the name from frontend if provided (for variations), otherwise use detected product name
        const displayName = productData.name || productName;

        const productSnapshot = {
          product_id: product.id,
          name: displayName,
          price: unitPrice.toString(),
          quantity: requestedQuantity,
          tht: lineTotal.toFixed(2),
          ttc: lineTotalWithTax.toFixed(2),
          tax_rate: taxRate.toString(),
          product_snapshot: {
            id: product.id,
            name: displayName,
            price: product.price,
            regular_price: product.regular_price,
            sale_price: product.sale_price || "",
            stock_quantity: currentStock, // Use the actual stock (variation or simple)
            stock_status: product.stock_status,
            sku: product.sku || "",
            image: product.images?.[0]?.src || null,
            // Include variation information if this is a variable product
            ...(productData.variation_id && {
              variation_id: productData.variation_id,
              variation_attributes: productData.variation_attributes || [],
            }),
          },
        };

        productsWithSnapshots.push(productSnapshot);
      }

      // Apply discount calculation (matching frontend logic)
      const discountPercentage = parseFloat(data.discount || "0");
      const discountAmount = totalTHT * (discountPercentage / 100);
      const subtotalAfterDiscount = totalTHT - discountAmount;

      // Group products by TVA rate and calculate TVA per rate (matching frontend logic)
      const tvaBreakdown = productsWithSnapshots.reduce(
        (acc, productSnapshot) => {
          const tvaRate = parseFloat(productSnapshot.tax_rate) || 19;
          const productTotal = parseFloat(productSnapshot.tht);
          // Calculate the taxable base (after discount) - matching frontend logic
          const productTaxableBase =
            productTotal * (1 - discountPercentage / 100);
          const productTva = productTaxableBase * (tvaRate / 100);

          if (!acc[tvaRate]) {
            acc[tvaRate] = {
              rate: tvaRate,
              base: 0,
              amount: 0,
            };
          }

          acc[tvaRate].base += productTaxableBase;
          acc[tvaRate].amount += productTva;

          return acc;
        },
        {} as Record<number, { rate: number; base: number; amount: number }>
      );

      const totalTvaAmount = Object.values(tvaBreakdown).reduce(
        (sum, tva) => sum + tva.amount,
        0
      );

      const finalTHT = subtotalAfterDiscount;
      const finalTTC = subtotalAfterDiscount + totalTvaAmount;

      // Create quote
      const globalTaxRate = parseFloat(data.tax_rate || "19");
      const quoteData = {
        client_id: data.client_id,
        status: data.status || QuoteStatus.Draft,
        tht: finalTHT.toFixed(2),
        ttc: finalTTC.toFixed(2),
        discount: discountPercentage.toString(),
        discount_type: data.discount_type || "percentage",
        tax_rate: globalTaxRate.toString(),
        notes: data.notes || "",
        valid_until: data.valid_until ? new Date(data.valid_until) : undefined,
        client_snapshot: {
          id: client.id,
          name: client.name,
          type: client.type,
          phone: client.phone,
          address: client.address,
          tva: client.tva,
        },
        products_snapshot: productsWithSnapshots,
      };

      const result = await this.repo.save(quoteData as any);

      if (result) {
        return {
          success: true,
          data: result,
          message: "Devis créé avec succès",
          stockWarnings: stockWarnings.length > 0 ? stockWarnings : undefined,
        };
      }

      return {
        success: false,
        message: "Échec de la création du devis",
      };
    } catch (error: any) {
      logger.error("Erreur lors de la création du devis:", error);
      return {
        success: false,
        message: error.message || "Échec de la création du devis",
      };
    }
  }

  async updateQuote(
    data: UpdateQuoteDto
  ): Promise<IResult<Quote> & { stockWarnings?: StockWarning[] }> {
    try {
      const existingQuote = await Quote.findByPk(data.id);
      if (!existingQuote) {
        return {
          success: false,
          message: "Devis non trouvé",
        };
      }

      let stockWarnings: StockWarning[] = [];
      let updateData: any = { ...data };

      // Always fetch the client (current or updated)
      const client = await Client.findByPk(
        data.client_id || existingQuote.client_id
      );
      if (!client) {
        return {
          success: false,
          message: "Client non trouvé",
        };
      }

      // Update client snapshot if client has changed or if explicitly requested
      if (data.client_id && data.client_id !== existingQuote.client_id) {
        updateData.client_snapshot = {
          id: client.id,
          name: client.name,
          type: client.type,
          phone: client.phone,
          address: client.address,
          tva: client.tva,
        };
      }

      // If products are being updated, recalculate everything
      if (data.products && data.products.length > 0) {
        const productsWithSnapshots = [];
        let totalTHT = 0;

        for (const productData of data.products) {
          const product = await Product.findByPk(productData.product_id);
          if (!product) {
            return {
              success: false,
              message: `Produit avec l'ID ${productData.product_id} non trouvé`,
            };
          }

          // Check stock availability based on product type
          let currentStock = 0;
          let productName = product.name;
          const requestedQuantity = productData.quantity;

          if (productData.variation_id) {
            // This is a variation - need to get variation-specific stock
            try {
              // For variations, we fetch from WooCommerce API
              const variationResult =
                await this.wooCommerceService.getProductVariation(
                  product.id,
                  parseInt(productData.variation_id)
                );

              if (variationResult) {
                currentStock = variationResult.stock_quantity || 0;
                // Create better name for variation
                if (
                  variationResult.attributes &&
                  variationResult.attributes.length > 0
                ) {
                  const attributeValues = variationResult.attributes
                    .map((attr: any) => attr.option)
                    .join(", ");
                  productName = `${product.name} - ${attributeValues}`;
                }
              } else {
                logger.warn(
                  `Variation ${productData.variation_id} not found, using parent product stock`
                );
                currentStock = product.stock_quantity || 0;
              }
            } catch (error) {
              logger.error(
                `Error fetching variation stock for ${productData.variation_id}:`,
                error
              );
              // Fallback to parent product stock
              currentStock = product.stock_quantity || 0;
            }
          } else {
            // This is a simple product - use local stock
            currentStock = product.stock_quantity || 0;
          }

          // Create stock warning if insufficient stock
          if (currentStock < requestedQuantity) {
            stockWarnings.push({
              product_id: productData.variation_id
                ? parseInt(productData.variation_id)
                : product.id,
              product_name: productData.name || productName,
              requested_quantity: requestedQuantity,
              current_stock: currentStock,
              shortage: requestedQuantity - currentStock,
            });
          }

          // Calculate prices - use product-specific tax rate from frontend
          const unitPrice = productData.price
            ? parseFloat(productData.price)
            : parseFloat(product.price || product.regular_price);
          const lineTotal = unitPrice * requestedQuantity;
          // Use tax rate from the specific product data (tva field from frontend)
          const taxRate =
            productData.tva ||
            parseFloat(data.tax_rate || existingQuote.tax_rate || "19");
          const lineTotalWithTax = lineTotal * (1 + taxRate / 100);

          totalTHT += lineTotal;

          // Create product snapshot
          // Use the name from frontend if provided (for variations), otherwise use detected product name
          const displayName = productData.name || productName;

          const productSnapshot = {
            product_id: product.id,
            name: displayName,
            price: unitPrice.toString(),
            quantity: requestedQuantity,
            tht: lineTotal.toFixed(2),
            ttc: lineTotalWithTax.toFixed(2),
            tax_rate: taxRate.toString(),
            product_snapshot: {
              id: product.id,
              name: displayName,
              price: product.price,
              regular_price: product.regular_price,
              sale_price: product.sale_price || "",
              stock_quantity: currentStock, // Use the actual stock (variation or simple)
              stock_status: product.stock_status,
              sku: product.sku || "",
              image: product.images?.[0]?.src || null,
              // Include variation information if this is a variable product
              ...(productData.variation_id && {
                variation_id: productData.variation_id,
                variation_attributes: productData.variation_attributes || [],
              }),
            },
          };

          productsWithSnapshots.push(productSnapshot);
        }

        // Apply discount calculation (matching frontend logic)
        const discountPercentage = parseFloat(
          data.discount || existingQuote.discount || "0"
        );
        const discountAmount = totalTHT * (discountPercentage / 100);
        const subtotalAfterDiscount = totalTHT - discountAmount;

        // Group products by TVA rate and calculate TVA per rate (matching frontend logic)
        const tvaBreakdown = productsWithSnapshots.reduce(
          (acc, productSnapshot) => {
            const tvaRate = parseFloat(productSnapshot.tax_rate) || 19;
            const productTotal = parseFloat(productSnapshot.tht);
            // Calculate the taxable base (after discount) - matching frontend logic
            const productTaxableBase =
              productTotal * (1 - discountPercentage / 100);
            const productTva = productTaxableBase * (tvaRate / 100);

            if (!acc[tvaRate]) {
              acc[tvaRate] = {
                rate: tvaRate,
                base: 0,
                amount: 0,
              };
            }

            acc[tvaRate].base += productTaxableBase;
            acc[tvaRate].amount += productTva;

            return acc;
          },
          {} as Record<number, { rate: number; base: number; amount: number }>
        );

        const totalTvaAmount = Object.values(tvaBreakdown).reduce(
          (sum, tva) => sum + tva.amount,
          0
        );

        const finalTHT = subtotalAfterDiscount;
        const finalTTC = subtotalAfterDiscount + totalTvaAmount;

        updateData = {
          ...updateData,
          tht: finalTHT.toFixed(2),
          ttc: finalTTC.toFixed(2),
          products_snapshot: productsWithSnapshots,
        };
      }

      const result = await this.repo.update(data.id.toString(), updateData);

      if (result) {
        return {
          success: true,
          data: result,
          message: "Devis mis à jour avec succès",
          stockWarnings: stockWarnings.length > 0 ? stockWarnings : undefined,
        };
      }

      return {
        success: false,
        message: "Échec de la mise à jour du devis",
      };
    } catch (error: any) {
      logger.error("Erreur lors de la mise à jour du devis:", error);
      return {
        success: false,
        message: error.message || "Échec de la mise à jour du devis",
      };
    }
  }

  async deleteQuote(id: number): Promise<IResult<Quote>> {
    try {
      await this.repo.delete(id.toString());
      return {
        success: true,
        message: "Devis supprimé avec succès",
      };
    } catch (error: any) {
      logger.error("Erreur lors de la suppression du devis:", error);
      return {
        success: false,
        message: error.message || "Échec de la suppression du devis",
      };
    }
  }

  async batchDelete(ids: number[]): Promise<IResult<Quote>> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "Aucun ID fourni pour la suppression",
      };
    }

    try {
      // First, find which quotes actually exist by using the model directly
      const existingQuotes = await this.findByIds(ids);

      const existingIds = existingQuotes.map((quote) => quote.id);
      const missingIds = ids.filter((id) => !existingIds.includes(id));

      if (existingIds.length === 0) {
        return {
          success: false,
          message: "Aucun devis trouvé pour la suppression",
        };
      }

      // Only delete existing quotes
      await this.repo.deleteMany(existingIds, {});

      let message = `${existingIds.length} devis supprimé(s) avec succès`;
      if (missingIds.length > 0) {
        message += ` (${missingIds.length} devis déjà supprimé(s))`;
      }

      return {
        success: true,
        message,
      };
    } catch (error: any) {
      logger.error("Une erreur s'est produite :", error);
      return {
        success: false,
        message:
          error.message ||
          "Une erreur s'est produite lors de la suppression des devis",
      };
    }
  }

  async getByIdWithRelations(id: number): Promise<IResult<Quote>> {
    try {
      const quote = await this.getById(id);

      if (!quote) {
        return {
          success: false,
          message: "Devis non trouvé",
        };
      }

      return {
        success: true,
        data: quote,
        message: "Devis récupéré avec succès",
      };
    } catch (error: any) {
      logger.error("Une erreur s'est produite :", error);
      return {
        success: false,
        message:
          error.message ||
          "Une erreur s'est produite lors de la récupération du devis",
      };
    }
  }

  async getAllWithFilters(
    queryParams: QuoteQueryDto & QueryParams
  ): Promise<IResults<Quote>> {
    try {
      // Extract quote-specific filters and build fields object
      const {
        status,
        client_id,
        date_from,
        date_to,
        search,
        search_key,
        ...coreParams
      } = queryParams;

      const fields: Record<string, any> = {};

      if (status) fields.status = status;
      if (client_id) fields.client_id = client_id;

      // Handle client name search in JSON field
      if (search && search_key === "client_name") {
        // Use Sequelize JSON operators for searching
        fields["client_snapshot.name"] = {
          [Op.like]: `%${search}%`,
        };

        // Clear the search and search_key so they're not processed again
        const params = {
          ...coreParams,
          search: undefined,
          search_key: undefined,
          fields,
        };

        return await this.repo.getAll(params);
      }

      // Handle date filtering through additional where conditions if needed
      const params = {
        ...coreParams,
        search,
        search_key,
        fields,
      };

      return await this.repo.getAll(params);
    } catch (error: any) {
      logger.error("Error in getAllWithFilters:", error);
      throw new HttpException(
        "Erreur lors de la récupération des données",
        500,
        error.message
      );
    }
  }

  async getByClientId(clientId: number): Promise<IResults<Quote>> {
    try {
      const result = await this.getAll({
        where: { client_id: clientId },
        order: [["createdAt", "DESC"]],
      } as any);
      return {
        success: true,
        count: result.count,
        rows: result.rows,
      };
    } catch (error: any) {
      logger.error(
        "Erreur lors de la récupération des devis par ID client:",
        error
      );
      return {
        success: false,
        count: 0,
        rows: [],
        message:
          error.message || "Échec de la récupération des devis par client",
      };
    }
  }

  async changeStatus(id: number, status: QuoteStatus): Promise<IResult<Quote>> {
    try {
      const quote = await this.getById(id.toString());
      if (!quote) {
        return {
          success: false,
          message: "Devis non trouvé",
        };
      }

      const result = await this.repo.update(id.toString(), { status });

      if (result) {
        return {
          success: true,
          data: result,
          message: `Statut du devis changé en ${status}`,
        };
      }

      return {
        success: false,
        message: "Échec de la mise à jour du statut du devis",
      };
    } catch (error: any) {
      logger.error("Erreur lors du changement de statut du devis:", error);
      return {
        success: false,
        message: error.message || "Échec du changement de statut du devis",
      };
    }
  }
}
