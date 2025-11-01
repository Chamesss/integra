import { AuthController } from "./controllers/auth.controller";
import { CategoryController } from "./controllers/category.controller";
import { ProductController } from "./controllers/product.controller";
import { AttributeController } from "./controllers/attribute.controller";
import { AttributeTermController } from "./controllers/attribute-term.controller";
import { ProductVariationController } from "./controllers/product-variation.controller";
import { ClientController } from "./controllers/client.controller";
import { InvoiceController } from "./controllers/invoice.controller";
import { EmployeeController } from "./controllers/employee.controller";
import { CreateCategoryDto, UpdateCategoryDto } from "./types/category.types";
import { CreateClientDto, UpdateClientDto } from "./types/client.types";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryDto,
} from "./types/employee.types";
import { QueryParams } from "./types/core.types";
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeTermDto,
  UpdateAttributeTermDto,
  AttributeTermQueryDto,
  CreateAttributeWithTermsDto,
  BatchUpdateAttributeTermsDto,
} from "./types/attribute.types";
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariationDto,
} from "./types/product.types";
import { TagController } from "./controllers/tag.controller";
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteQueryDto,
  QuoteStatus,
} from "./types/quote.types";
import { QuoteController } from "./controllers/quote.controller";
import { CreateInvoiceDto, InvoiceStatus } from "./types/invoice.types";
import { logger } from "./utils/logger";
import { createWithAuth } from "./middleware/ipc-auth";
import { AnalyticsController } from "./controllers/analytics.controller";

export async function mainHandlers(ipcMain: Electron.IpcMain) {
  const authController = new AuthController();
  const categoryController = new CategoryController();
  const productController = new ProductController();
  const attributeController = new AttributeController();
  const attributeTermController = new AttributeTermController();
  const productVariationController = new ProductVariationController();
  const tagController = new TagController();
  const clientController = new ClientController();
  const quoteController = new QuoteController();
  const invoiceController = new InvoiceController();
  const employeeController = new EmployeeController();
  const analyticsController = new AnalyticsController();
  const withAuth = createWithAuth();

  // authentication handlers - No auth middleware needed
  ipcMain.handle("auth:signup", (_event, args) =>
    authController.register(args)
  );
  ipcMain.handle("auth:login", (_event, args) => authController.login(args));

  // user handlers
  ipcMain.handle("user:get", (_event, args) => authController.getUser(args));

  // category handlers
  ipcMain.handle(
    "category:getAll",
    withAuth(async (_event, args: QueryParams) => {
      try {
        return await categoryController.syncAndGetCategories(args);
      } catch (error: any) {
        logger.error("Category sync error:", error);
        return {
          success: false,
          error: error?.message || "Category sync failed",
          message: "Failed to sync categories",
          count: 0,
          rows: [],
        };
      }
    })
  );
  ipcMain.handle(
    "category:create",
    withAuth(async (_event, args: CreateCategoryDto) =>
      categoryController.createCategory(args)
    )
  );
  ipcMain.handle(
    "category:update",
    withAuth(async (_event, args: UpdateCategoryDto) =>
      categoryController.updateCategory(args)
    )
  );
  ipcMain.handle(
    "category:delete",
    withAuth(async (_event, id: { id: number }) =>
      categoryController.deleteCategory(id)
    )
  );
  ipcMain.handle(
    "category:batchDelete",
    withAuth(async (_event, ids: { ids: number[] }) =>
      categoryController.batchDeleteCategories(ids)
    )
  );

  // product handlers
  ipcMain.handle(
    "product:getAll",
    withAuth(async (_event, args: QueryParams) =>
      productController.syncAndGetProducts(args)
    )
  );
  ipcMain.handle(
    "product:getById",
    withAuth(async (_event, id: { id: number }) =>
      productController.getById(id)
    )
  );
  ipcMain.handle(
    "product:create",
    withAuth(async (_event, args: CreateProductDto) =>
      productController.createProduct(args)
    )
  );
  ipcMain.handle(
    "product:update",
    withAuth(async (_event, args: UpdateProductDto) =>
      productController.updateProduct(args)
    )
  );
  ipcMain.handle(
    "product:delete",
    withAuth(async (_event, id: { id: number }) =>
      productController.deleteProduct(id)
    )
  );
  ipcMain.handle(
    "product:batchDelete",
    withAuth(async (_event, ids: { ids: number[] }) =>
      productController.batchDeleteProducts(ids)
    )
  );

  // attribute handlers
  ipcMain.handle(
    "attribute:sync",
    withAuth(async (_event, args: QueryParams) => {
      try {
        return await attributeController.syncAndGetAttributes(args);
      } catch (error: any) {
        logger.error("Attribute sync error:", error);
        return {
          success: false,
          error: error?.message || "Attribute sync failed",
          message: "Failed to sync attributes",
          count: 0,
          rows: [],
        };
      }
    })
  );
  ipcMain.handle(
    "attribute:getAll",
    withAuth(async (_event, args: QueryParams) =>
      attributeController.getAllAttributes(args)
    )
  );
  ipcMain.handle(
    "attribute:getById",
    withAuth(async (_event, args: { id: string }) =>
      attributeController.getAttributeById(args)
    )
  );
  ipcMain.handle(
    "attribute:create",
    withAuth(async (_event, args: CreateAttributeDto) =>
      attributeController.createAttribute(args)
    )
  );
  ipcMain.handle(
    "attributeWithTerms:create",
    withAuth(async (_event, args: CreateAttributeWithTermsDto) =>
      attributeController.createAttributeWithTerms(args)
    )
  );
  ipcMain.handle(
    "attribute:update",
    withAuth(async (_event, args: UpdateAttributeDto) =>
      attributeController.updateAttribute(args)
    )
  );
  ipcMain.handle(
    "attribute:delete",
    withAuth(async (_event, id: { id: number }) =>
      attributeController.deleteAttribute(id)
    )
  );
  ipcMain.handle(
    "attribute:batchDelete",
    withAuth(async (_event, ids: { ids: number[] }) =>
      attributeController.batchDeleteAttributes(ids)
    )
  );

  // attribute term handlers
  ipcMain.handle(
    "attributeTerm:sync",
    withAuth(
      async (_event, args: { attributeId: number; queryParams: QueryParams }) =>
        attributeTermController.syncAndGetAttributeTerms(args)
    )
  );
  ipcMain.handle(
    "attributeTerm:getAll",
    withAuth(async (_event, args: AttributeTermQueryDto) =>
      attributeTermController.getAllAttributeTerms(args)
    )
  );
  ipcMain.handle(
    "attributeTerm:getByAttributeId",
    withAuth(
      async (
        _event,
        args: { attributeId: number; queryParams: AttributeTermQueryDto }
      ) => attributeTermController.getAttributeTermsByAttributeId(args)
    )
  );
  ipcMain.handle(
    "attributeTerm:create",
    withAuth(async (_event, args: CreateAttributeTermDto) =>
      attributeTermController.createAttributeTerm(args)
    )
  );
  ipcMain.handle(
    "attributeTerm:update",
    withAuth(async (_event, args: UpdateAttributeTermDto) =>
      attributeTermController.updateAttributeTerm(args)
    )
  );
  ipcMain.handle(
    "attributeTerm:delete",
    withAuth(async (_event, id: { id: number }) =>
      attributeTermController.deleteAttributeTerm(id)
    )
  );
  ipcMain.handle(
    "attributeTerm:batchDelete",
    withAuth(async (_event, ids: { ids: number[] }) =>
      attributeTermController.batchDeleteAttributeTerms(ids)
    )
  );
  ipcMain.handle(
    "attributeTerm:batchUpdate",
    withAuth(
      async (
        _event,
        args: {
          attributeId: number;
          termsData: BatchUpdateAttributeTermsDto;
        }
      ) => attributeTermController.batchUpdateProductAttributeTerms(args)
    )
  );

  // tags
  ipcMain.handle(
    "tag:sync",
    withAuth(async (_event, args: QueryParams) => {
      try {
        return await tagController.syncAndGetTags(args);
      } catch (error: any) {
        logger.error("Tag sync error:", error);
        return {
          success: false,
          error: error?.message || "Tag sync failed",
          message: "Failed to sync tags",
          count: 0,
          rows: [],
        };
      }
    })
  );

  ipcMain.handle(
    "tag:getAll",
    withAuth(async (_event, args: QueryParams) =>
      tagController.getAllTags(args)
    )
  );

  ipcMain.handle(
    "tag:create",
    withAuth(async (_event, args: { name: string }) =>
      tagController.createTags(args)
    )
  );

  ipcMain.handle(
    "tag:delete",
    withAuth(async (_event, id: { id: number }) => tagController.deleteTag(id))
  );

  ipcMain.handle(
    "tag:batchDelete",
    withAuth(async (_event, ids: { ids: number[] }) =>
      tagController.batchDeleteTags(ids)
    )
  );

  ipcMain.handle(
    "tag:update",
    withAuth(async (_event, args: { id: number; name: string }) =>
      tagController.updateTag(args)
    )
  );

  // product variations
  ipcMain.handle(
    "variation:create",
    withAuth(
      async (
        _event,
        args: { productId: number; variations: CreateVariationDto[] }
      ) => productVariationController.createVariations(args)
    )
  );

  ipcMain.handle(
    "variation:getAll",
    withAuth(async (_event, args: { productId: number }) =>
      productVariationController.getProductVariations(args)
    )
  );

  ipcMain.handle(
    "variation:getByProduct",
    withAuth(async (_event, args: { productId: number }) =>
      productVariationController.getProductVariations(args)
    )
  );

  ipcMain.handle(
    "variation:update",
    withAuth(
      async (
        _event,
        args: {
          productId: number;
          variationId: number;
          variationData: CreateVariationDto;
        }
      ) => productVariationController.updateVariation(args)
    )
  );

  ipcMain.handle(
    "variation:delete",
    withAuth(async (_event, args: { productId: number; variationId: number }) =>
      productVariationController.deleteVariation(args)
    )
  );

  ipcMain.handle(
    "variation:sync",
    withAuth(async (_event, args: { productId: number }) =>
      productVariationController.syncVariations(args)
    )
  );

  ipcMain.handle(
    "variation:generateFromWooCommerce",
    withAuth(async (_event, args: { productId: number }) =>
      productVariationController.syncVariations(args)
    )
  );

  ipcMain.handle(
    "variation:convertToVariable",
    withAuth(async (_event, args: { productId: number }) =>
      productVariationController.convertToVariableProduct(args)
    )
  );

  ipcMain.handle(
    "variation:updateAttributes",
    withAuth(
      async (
        _event,
        args: {
          productId: number;
          attributes: Array<{
            id: number;
            name: string;
            variation: boolean;
            visible: boolean;
            options: string[];
          }>;
        }
      ) => productVariationController.updateProductAttributes(args)
    )
  );

  // client handlers
  ipcMain.handle(
    "client:getAll",
    withAuth(async (_event, args: QueryParams) =>
      clientController.getAllClients(args)
    )
  );

  ipcMain.handle(
    "client:create",
    withAuth(async (_event, args: CreateClientDto) =>
      clientController.createClient(args)
    )
  );

  ipcMain.handle(
    "client:delete",
    withAuth(async (_event, id: { id: number }) =>
      clientController.deleteClient(id)
    )
  );

  ipcMain.handle(
    "client:batchDelete",
    withAuth(async (_event, ids: { ids: number[] }) =>
      clientController.batchDeleteClients(ids)
    )
  );

  ipcMain.handle(
    "client:update",
    withAuth(async (_event, args: UpdateClientDto) =>
      clientController.updateClient(args)
    )
  );

  // employee handlers
  ipcMain.handle(
    "employee:getAll",
    withAuth(async (_event, args: EmployeeQueryDto) =>
      employeeController.getAll(_event, args)
    )
  );

  ipcMain.handle(
    "employee:getById",
    withAuth(async (_event, id: number) =>
      employeeController.getById(_event, id)
    )
  );

  ipcMain.handle(
    "employee:create",
    withAuth(async (_event, args: CreateEmployeeDto) =>
      employeeController.create(_event, args)
    )
  );

  ipcMain.handle(
    "employee:update",
    withAuth(
      async (_event, { id, data }: { id: number; data: UpdateEmployeeDto }) =>
        employeeController.update(_event, id, data)
    )
  );

  ipcMain.handle(
    "employee:delete",
    withAuth(async (_event, args: { id: number }) =>
      employeeController.delete(_event, args)
    )
  );

  ipcMain.handle(
    "employee:batchDelete",
    withAuth(async (_event, args: { ids: number[] }) =>
      employeeController.batchDelete(_event, args)
    )
  );

  // quote handlers
  ipcMain.handle(
    "quote:getAll",
    withAuth(async (_event, args: QuoteQueryDto & QueryParams) =>
      quoteController.getAllQuotes(args)
    )
  );

  ipcMain.handle(
    "quote:getById",
    withAuth(async (_event, args: { id: number }) =>
      quoteController.getQuoteById(args)
    )
  );

  ipcMain.handle(
    "quote:getByClientId",
    withAuth(async (_event, args: { clientId: number }) =>
      quoteController.getQuotesByClientId(args)
    )
  );

  ipcMain.handle(
    "quote:create",
    withAuth(async (_event, args: CreateQuoteDto) =>
      quoteController.createQuote(args)
    )
  );

  ipcMain.handle(
    "quote:update",
    withAuth(async (_event, args: UpdateQuoteDto) =>
      quoteController.updateQuote(args)
    )
  );

  ipcMain.handle(
    "quote:delete",
    withAuth(async (_event, args: { id: number }) =>
      quoteController.deleteQuote(args)
    )
  );

  ipcMain.handle(
    "quote:batchDelete",
    withAuth(async (_event, args: { ids: number[] }) =>
      quoteController.batchDeleteQuotes(args)
    )
  );

  ipcMain.handle(
    "quote:changeStatus",
    withAuth(async (_event, args: { id: number; status: QuoteStatus }) =>
      quoteController.changeQuoteStatus(args)
    )
  );

  // invoice handlers
  ipcMain.handle(
    "invoice:getAll",
    withAuth(async (_event, args: QueryParams) =>
      invoiceController.getAllInvoices(args)
    )
  );

  ipcMain.handle(
    "invoice:getById",
    withAuth(async (_event, args: { id: number }) =>
      invoiceController.findById(args.id)
    )
  );

  ipcMain.handle(
    "invoice:create",
    withAuth(async (_event, args: CreateInvoiceDto) =>
      invoiceController.create(args)
    )
  );

  ipcMain.handle(
    "invoice:createFromQuote",
    withAuth(
      async (
        _event,
        args: { quoteId: number; additionalData?: Partial<CreateInvoiceDto> }
      ) => invoiceController.createFromQuote(args.quoteId, args.additionalData)
    )
  );

  ipcMain.handle(
    "invoice:update",
    withAuth(
      async (_event, args: { id: number; data: Partial<CreateInvoiceDto> }) =>
        invoiceController.update(args.id, args.data)
    )
  );

  ipcMain.handle(
    "invoice:delete",
    withAuth(async (_event, args: { id: number }) =>
      invoiceController.delete(args.id)
    )
  );

  ipcMain.handle(
    "invoice:batchDelete",
    withAuth(async (_event, args: { ids: number[] }) =>
      invoiceController.batchDeleteInvoices(args.ids)
    )
  );

  ipcMain.handle(
    "invoice:changeStatus",
    withAuth(async (_event, args: { id: number; status: InvoiceStatus }) =>
      invoiceController.changeStatus(args.id, args.status)
    )
  );

  ipcMain.handle(
    "invoice:findByQuote",
    withAuth(async (_event, args: { quoteId: number }) =>
      invoiceController.findByQuote(args.quoteId)
    )
  );

  ipcMain.handle(
    "invoice:findOverdue",
    withAuth(async (_event) => invoiceController.findOverdue())
  );

  ipcMain.handle(
    "invoice:validateStock",
    withAuth(async (_event, args: { products: CreateInvoiceDto["products"] }) =>
      invoiceController.validateStock(args.products)
    )
  );

  // Analytics handlers
  ipcMain.handle(
    "analytics:getMonthlyRevenue",
    withAuth(async (_event, args: { months?: number }) =>
      analyticsController.getMonthlyRevenue(args)
    )
  );

  ipcMain.handle(
    "analytics:getMonthlyComparison",
    withAuth(async (_event, args: { months?: number }) =>
      analyticsController.getMonthlyComparison(args)
    )
  );

  ipcMain.handle(
    "analytics:getSummary",
    withAuth(async (_event) => analyticsController.getAnalyticsSummary())
  );
}
