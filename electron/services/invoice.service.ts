import { Invoice } from "../models/invoice";
import { CoreService } from "./core.service";
import { InvoiceRepo } from "../repositories/invoice.repo";
import { ProductRepo } from "../repositories/product.repo";
import { ClientRepo } from "../repositories/client.repo";
import { QuoteRepo } from "../repositories/quote.repo";
import { WooCommerceService } from "../api/woocommerce.service";
import {
  CreateInvoiceDto,
  InvoiceQueryDto,
  StockValidationResult,
  StockValidationError,
  InvoiceStatus,
} from "../types/invoice.types";
import { CreateVariationDto, UpdateVariationDto } from "../types/product.types";
import { IResult, IResults } from "../types/core.types";
import { HttpException } from "../utils/http-exception";
import { logger } from "../utils/logger";
import { Op } from "sequelize";

export class InvoiceService extends CoreService<
  Invoice,
  CreateInvoiceDto,
  InvoiceQueryDto,
  Partial<CreateInvoiceDto>
> {
  private productRepo: ProductRepo;
  private clientRepo: ClientRepo;
  private quoteRepo: QuoteRepo;
  private wooService: WooCommerceService;

  constructor() {
    super(new InvoiceRepo());
    this.productRepo = new ProductRepo();
    this.clientRepo = new ClientRepo();
    this.quoteRepo = new QuoteRepo();
    this.wooService = new WooCommerceService();
  }

  async validateStock(
    products: CreateInvoiceDto["products"]
  ): Promise<StockValidationResult> {
    const errors: StockValidationError[] = [];

    for (const productItem of products) {
      let availableStock = 0;
      let productName = `ID du produit ${productItem.product_id}`;

      if (productItem.variation_id && productItem.parent_product_id) {
        try {
          const variation = await this.wooService.getProductVariation(
            productItem.parent_product_id,
            productItem.variation_id
          );

          if (variation) {
            availableStock = variation.stock_quantity || 0;
            productName =
              variation.name || `Variation ${productItem.variation_id}`;
          } else {
            errors.push({
              product_id: productItem.product_id,
              product_name: `Variation ${productItem.variation_id}`,
              requested_quantity: productItem.quantity,
              available_quantity: 0,
              shortage: productItem.quantity,
            });
            continue;
          }
        } catch (error) {
          errors.push({
            product_id: productItem.product_id,
            product_name: `Variation ${productItem.variation_id}`,
            requested_quantity: productItem.quantity,
            available_quantity: 0,
            shortage: productItem.quantity,
          });
          continue;
        }
      } else {
        const product = await this.productRepo.getById(productItem.product_id);
        if (!product) {
          logger.warn(`Produit non trouvé: ${productItem.product_id}`);
          errors.push({
            product_id: productItem.product_id,
            product_name: productName,
            requested_quantity: productItem.quantity,
            available_quantity: 0,
            shortage: productItem.quantity,
          });
          continue;
        }

        availableStock = product.stock_quantity || 0;
        productName = product.name;
      }

      // Check if requested quantity exceeds available stock
      if (productItem.quantity > availableStock) {
        logger.warn(
          `Stock insuffisant pour ${productName}: demandé ${productItem.quantity}, disponible ${availableStock}`
        );
        errors.push({
          product_id: productItem.product_id,
          product_name: productName,
          requested_quantity: productItem.quantity,
          available_quantity: availableStock,
          shortage: productItem.quantity - availableStock,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async deductStock(products: CreateInvoiceDto["products"]): Promise<void> {
    const variationsByProduct = new Map<
      number,
      Array<{
        variation_id: number;
        quantity: number;
        productItem: CreateInvoiceDto["products"][0];
      }>
    >();

    const regularProducts: Array<{
      product_id: number;
      quantity: number;
      productItem: CreateInvoiceDto["products"][0];
    }> = [];

    // Separate variations from regular products
    for (const productItem of products) {
      if (productItem.variation_id && productItem.parent_product_id) {
        if (!variationsByProduct.has(productItem.parent_product_id)) {
          variationsByProduct.set(productItem.parent_product_id, []);
        }
        variationsByProduct.get(productItem.parent_product_id)!.push({
          variation_id: productItem.variation_id,
          quantity: productItem.quantity,
          productItem,
        });
      } else {
        regularProducts.push({
          product_id: productItem.product_id,
          quantity: productItem.quantity,
          productItem,
        });
      }
    }

    for (const [parentProductId, variations] of variationsByProduct) {
      try {
        await this.batchDeductVariationStock(parentProductId, variations);
      } catch (error) {
        logger.error(
          `Erreur lors de la déduction en lot pour le produit ${parentProductId}:`,
          error
        );
        // Fallback to individual updates if batch fails
        await this.fallbackIndividualVariationDeduction(
          parentProductId,
          variations
        );
      }
    }

    // Process regular products (both local database and WooCommerce updates)
    for (const { product_id, quantity } of regularProducts) {
      try {
        // Update local database
        const product = await this.productRepo.getById(product_id);
        if (product) {
          const currentStock = product.stock_quantity || 0;
          const newStock = Math.max(0, currentStock - quantity);

          await this.productRepo.update(product_id.toString(), {
            stock_quantity: newStock,
          });

          try {
            logger.info(
              `🚀 Updating WooCommerce stock for simple product ${product_id}: ${currentStock} -> ${newStock}`
            );

            await this.wooService.updateProduct(product_id, {
              stock_quantity: newStock,
            });
          } catch (wooError) {
            logger.error(
              `Failed to update WooCommerce stock for product ${product_id}:`,
              wooError
            );
            // Don't throw here - local update succeeded, WooCommerce update failed
          }
        } else {
          logger.warn(`Product not found for stock deduction: ${product_id}`);
        }
      } catch (error) {
        logger.error(`Error deducting stock for product ${product_id}:`, error);
      }
    }
  }

  async findByQuoteId(quoteId: number): Promise<IResults<Invoice>> {
    try {
      return await this.getAll({
        fields: {
          quote_id: quoteId,
        },
      } as any);
    } catch (error) {
      throw new Error(
        `Une erreur est survenue lors de la recherche des factures par ID de devis: ${error}`
      );
    }
  }

  async findOverdueInvoices(): Promise<IResults<Invoice>> {
    try {
      const currentDate = new Date();
      return await this.getAll({
        sortKey: "due_date",
        sort: "asc",
        fields: {
          status: {
            [Op.notIn]: ["paid", "cancelled"],
          },
          due_date: {
            [Op.lt]: currentDate,
          },
        },
      });
    } catch (error) {
      throw new Error(
        `Une erreur est survenue lors de la recherche des factures en retard: ${error}`
      );
    }
  }

  /**
   * Batch deduct stock for variations of a single parent product
   */
  private async batchDeductVariationStock(
    parentProductId: number,
    variations: Array<{
      variation_id: number;
      quantity: number;
      productItem: CreateInvoiceDto["products"][0];
    }>
  ): Promise<void> {
    const currentVariations =
      await this.wooService.getProductVariations(parentProductId);

    const updatePayload: UpdateVariationDto[] = [];

    for (const { variation_id, quantity } of variations) {
      currentVariations.forEach((v) => {
        logger.info(
          `  - WooCommerce ID: ${v.id} (type: ${typeof v.id}) | Searching for: ${variation_id} (type: ${typeof variation_id}) | Match: ${v.id === variation_id} | Loose match: ${v.id == variation_id}`
        );
      });

      const currentVariation = currentVariations.find(
        (v) => v.id == variation_id // Using loose equality to handle type mismatches
      );

      if (currentVariation) {
        const currentStock = currentVariation.stock_quantity || 0;
        const newStock = Math.max(0, currentStock - quantity);

        updatePayload.push({
          id: variation_id,
          stock_quantity: newStock,
          // Preserve existing attributes to avoid overwriting variation data
          attributes: currentVariation.attributes || [],
        });
      } else {
        logger.warn(
          `Variation ${variation_id} not found for batch stock deduction`
        );
      }
    }

    // Perform batch update if we have variations to update
    if (updatePayload.length > 0) {
      await this.wooService.batchUpdateProductVariations(
        parentProductId,
        updatePayload
      );
    } else {
      logger.warn(`⚠️ No variations to update for product ${parentProductId}`);
    }
  }

  /**
   * Fallback method: deduct stock individually if batch fails
   */
  private async fallbackIndividualVariationDeduction(
    parentProductId: number,
    variations: Array<{
      variation_id: number;
      quantity: number;
      productItem: CreateInvoiceDto["products"][0];
    }>
  ): Promise<void> {
    logger.warn(
      `Falling back to individual variation updates for product ${parentProductId}`
    );

    for (const { variation_id, quantity } of variations) {
      try {
        const variation = await this.wooService.getProductVariation(
          parentProductId,
          variation_id
        );

        if (variation) {
          const currentStock = variation.stock_quantity || 0;
          const newStock = Math.max(0, currentStock - quantity);
          await this.wooService.updateProductVariation(
            parentProductId,
            variation_id,
            {
              stock_quantity: newStock,
              attributes: variation.attributes || [],
            } as CreateVariationDto
          );
        } else {
          logger.warn(
            `Variation ${variation_id} not found for stock deduction`
          );
        }
      } catch (error) {
        logger.error(
          `Error deducting stock for variation ${variation_id}:`,
          error
        );
      }
    }
  }

  async createFromQuote(
    quoteId: number,
    additionalData: Partial<CreateInvoiceDto> = {}
  ): Promise<IResult<Invoice>> {
    try {
      const quote = await this.quoteRepo.getById(quoteId);
      if (!quote) {
        throw new HttpException("Quote not found", 404);
      }

      const products = quote.products_snapshot.map((product: any) => {
        const finalProductId =
          product.product_snapshot?.variation_id || product.product_id;

        const convertedProduct = {
          product_id: finalProductId,
          quantity: product.quantity,
          price: product.price,
          name: product.name, // Preserve the name from the quote (which includes variation info)
          tva: parseFloat(product.tax_rate),
          variation_id: product.product_snapshot?.variation_id,
          parent_product_id: product.product_snapshot?.variation_id
            ? product.product_id
            : undefined,
          variation_attributes:
            product.product_snapshot?.variation_attributes || [],
        };
        return convertedProduct;
      });

      // Validate stock
      const stockValidation = await this.validateStock(products);
      if (!stockValidation.valid) {
        return {
          success: false,
          message: "Stock insuffisant pour certains produits",
          data: stockValidation.errors as any,
        };
      }

      const invoiceData: CreateInvoiceDto = {
        quote_id: quoteId,
        client_id: quote.client_id,
        products,
        discount: quote.discount,
        discount_type: quote.discount_type,
        tax_rate: quote.tax_rate,
        notes: quote.notes,
        status: InvoiceStatus.Draft,
        ...additionalData,
        // Default timbre fiscal if not provided in additionalData
        timbre_fiscal: additionalData?.timbre_fiscal || "1.000", // 1 TND
      };

      const result = await this.create(invoiceData);

      if (result.success && result.data) {
        await this.deductStock(products);
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async create(data: CreateInvoiceDto): Promise<IResult<Invoice>> {
    try {
      // Validate stock first
      const stockValidation = await this.validateStock(data.products);
      if (!stockValidation.valid) {
        return {
          success: false,
          message: "Stock insuffisant pour certains produits",
          data: stockValidation.errors as any,
        };
      }

      // Get client data for snapshot
      const client = await this.clientRepo.getById(data.client_id);
      if (!client) {
        throw new HttpException("Client non trouvé", 404);
      }

      // Get products data and create snapshots
      const productsSnapshot = [];
      let subtotalHT = 0;
      let totalTvaAmount = 0;

      for (const productItem of data.products) {
        let product;
        let productName;
        let productPrice;
        let variationData = null;

        // Use provided name if available (e.g., from quote with variation info)
        if (productItem.name) {
          productName = productItem.name;
        }

        // Check if this is a variation
        if (productItem.variation_id && productItem.parent_product_id) {
          product = await this.productRepo.getById(
            productItem.parent_product_id
          );
          if (!product) {
            throw new HttpException(
              `Produit parent avec l'ID ${productItem.parent_product_id} introuvable`,
              404
            );
          }

          try {
            variationData = await this.wooService.getProductVariation(
              productItem.parent_product_id,
              productItem.variation_id
            );
            // Only override productName if it wasn't provided
            if (!productName) {
              productName =
                variationData?.name || `${product.name} (Variation)`;
            }
            productPrice =
              variationData?.regular_price ||
              productItem.price ||
              product.price;
          } catch (error) {
            logger.warn(
              `Could not fetch variation data for ${productItem.variation_id}, using parent product data`
            );
            // Only set default name if not provided
            if (!productName) {
              productName = product.name;
            }
            productPrice = productItem.price || product.price;
          }
        } else {
          product = await this.productRepo.getById(productItem.product_id);
          if (!product) {
            throw new HttpException(
              `Produit avec l'ID ${productItem.product_id} non trouvé`,
              404
            );
          }
          // Only use product name if not provided
          if (!productName) {
            productName = product.name;
          }
          productPrice = productItem.price || product.price;
        }

        const price = productPrice;
        const quantity = productItem.quantity;
        const tvaRate = productItem.tva || parseFloat(data.tax_rate || "19");

        const productTotalHT = parseFloat(price) * quantity;
        const productTvaAmount = (productTotalHT * tvaRate) / 100;
        const productTotalTTC = productTotalHT + productTvaAmount;

        subtotalHT += productTotalHT;
        totalTvaAmount += productTvaAmount;

        productsSnapshot.push({
          product_id: productItem.variation_id || product.id,
          name: productName,
          price: price,
          quantity: quantity,
          tht: productTotalHT.toFixed(2),
          ttc: productTotalTTC.toFixed(2),
          tax_rate: tvaRate.toString(),
          product_snapshot: {
            id: product.id,
            name: productName,
            price: product.price,
            regular_price: product.regular_price || product.price,
            sale_price: product.sale_price || "",
            stock_quantity:
              variationData?.stock_quantity || product.stock_quantity || 0,
            stock_status:
              variationData?.stock_status || product.stock_status || "instock",
            sku: variationData?.sku || product.sku || "",
            image: product.images?.[0]?.src || null,
            ...(productItem.variation_id && {
              variation_id: productItem.variation_id,
              variation_attributes: productItem.variation_attributes || [],
            }),
          },
        });
      }

      const discountAmount =
        data.discount_type === "percentage"
          ? (subtotalHT * parseFloat(data.discount || "0")) / 100
          : parseFloat(data.discount || "0");

      const subtotalAfterDiscount = subtotalHT - discountAmount;
      const finalTvaAmount =
        (subtotalAfterDiscount * totalTvaAmount) / subtotalHT;
      const timbreFiscal = parseFloat(data.timbre_fiscal || "1");
      const totalTTC = subtotalAfterDiscount + finalTvaAmount + timbreFiscal;

      const invoiceData = {
        client_id: data.client_id,
        quote_id: data.quote_id,
        status: data.status || InvoiceStatus.Draft,
        tht: subtotalAfterDiscount.toFixed(2),
        ttc: totalTTC.toFixed(2),
        discount: data.discount || "0",
        discount_type: data.discount_type || "percentage",
        tax_rate: data.tax_rate || "19",
        timbre_fiscal: timbreFiscal.toFixed(2),
        notes: data.notes,
        due_date: data.due_date ? new Date(data.due_date) : null,
        client_snapshot: {
          id: client.id,
          name: client.name,
          type: client.type,
          phone: client.phone,
          address: client.address,
          tva: client.tva,
        },
        products_snapshot: productsSnapshot,
      };

      const invoice = await this.save(invoiceData as any);

      return {
        success: true,
        message: "Facture créée avec succès",
        data: invoice,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async changeStatus(
    id: number,
    status: InvoiceStatus
  ): Promise<IResult<Invoice>> {
    logger.info(
      `🔄 CHANGE STATUS CALLED! Invoice ${id} changing to status: ${status}`
    );

    try {
      const currentInvoice = await this.repo.getById(id.toString());
      if (!currentInvoice) {
        logger.error(`❌ Invoice ${id} not found`);
        return {
          success: false,
          message: "Facture non trouvée",
        };
      }

      const updateData: any = { status };

      if (status === InvoiceStatus.Paid) {
        updateData.paid_date = new Date();

        const products = currentInvoice.products_snapshot.map(
          (product: any) => ({
            product_id:
              product.product_snapshot?.variation_id || product.product_id,
            quantity: product.quantity,
            variation_id: product.product_snapshot?.variation_id,
            parent_product_id: product.product_snapshot?.variation_id
              ? product.product_id
              : undefined,
            variation_attributes:
              product.product_snapshot?.variation_attributes || [],
          })
        );

        await this.deductStock(products);
      }

      const invoice = await this.repo.update(id.toString(), updateData);
      if (!invoice) {
        return {
          success: false,
          message: "Facture non trouvée",
        };
      }

      return {
        success: true,
        message: "Statut de la facture mis à jour avec succès",
        data: invoice,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findByQuote(quoteId: number): Promise<IResults<Invoice>> {
    try {
      return await this.findByQuoteId(quoteId);
    } catch (error: any) {
      logger.error(`Error finding invoices by quote ID ${quoteId}:`, error);
      return {
        success: false,
        message: error.message,
        rows: [],
        count: 0,
      };
    }
  }

  async findOverdue(): Promise<IResults<Invoice>> {
    try {
      return await this.findOverdueInvoices();
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        rows: [],
        count: 0,
      };
    }
  }

  async getAllWithFilters(
    queryParams: InvoiceQueryDto & any
  ): Promise<IResults<Invoice>> {
    try {
      // Extract invoice-specific filters and build fields object
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

  async batchDelete(ids: number[]): Promise<IResult<Invoice>> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "Aucun ID fourni pour la suppression",
      };
    }

    try {
      const existingInvoices = await this.findByIds(ids);

      const existingIds = existingInvoices.map((invoice) => invoice.id);
      const missingIds = ids.filter((id) => !existingIds.includes(id));

      if (existingIds.length === 0) {
        return {
          success: false,
          message: "Aucune facture trouvée pour la suppression",
        };
      }

      // Only delete existing invoices
      await this.repo.deleteMany(existingIds, {});

      let message = `${existingIds.length} facture(s) supprimée(s) avec succès`;
      if (missingIds.length > 0) {
        message += ` (${missingIds.length} facture(s) déjà supprimée(s))`;
      }

      return {
        success: true,
        message,
      };
    } catch (error: any) {
      logger.error("Error batch deleting quotes:", error);
      return {
        success: false,
        message: error.message || "Échec de la suppression des devis",
      };
    }
  }
}
