import { LoginProps } from "@/types/LoginProps";
import { ipcRenderer, contextBridge } from "electron";
import { UserCreateDto } from "./types/user.types";
import { CreateCategoryDto } from "./types/category.types";
import { CreateProductDto } from "./types/product.types";
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeTermDto,
  UpdateAttributeTermDto,
  CreateAttributeWithTermsDto,
  BatchUpdateAttributeTermsDto,
} from "./types/attribute.types";
import { QueryParams } from "./types/core.types";
import { preloadAuth } from "./middleware/preload-auth";
import {
  CreateEmployeeDto,
  EmployeeQueryDto,
  UpdateEmployeeDto,
} from "./types/employee.types";

ipcRenderer.on("auth:request-token", async () => {
  const token = await preloadAuth();
  ipcRenderer.send("auth:response-token", token);
});

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  getUser: (token: string) => ipcRenderer.invoke("user:get", token),

  // category management
  getCategories: (params?: QueryParams) =>
    ipcRenderer.invoke("category:getAll", params),
  getCategory: (id: number) => ipcRenderer.invoke("category:get", id),
  createCategory: (categoryData: CreateCategoryDto) =>
    ipcRenderer.invoke("category:create", categoryData),
  updateCategory: (categoryData: CreateCategoryDto) =>
    ipcRenderer.invoke("category:update", categoryData),
  deleteCategory: async (id: { id: number }) =>
    await ipcRenderer.invoke("category:delete", id),
  batchDeleteCategories: async (categoryIds: number[]) =>
    await ipcRenderer.invoke("category:batchDelete", categoryIds),

  // product management
  getProducts: (params?: QueryParams) =>
    ipcRenderer.invoke("product:getAll", params),
  getProduct: (id: number) => ipcRenderer.invoke("product:getById", id),
  createProduct: (productData: CreateProductDto) =>
    ipcRenderer.invoke("product:create", productData),
  updateProduct: (productData: CreateProductDto) =>
    ipcRenderer.invoke("product:update", productData),
  deleteProduct: async (id: { id: number }) =>
    await ipcRenderer.invoke("product:delete", id),
  batchDeleteProducts: async (productIds: number[]) =>
    await ipcRenderer.invoke("product:batchDelete", productIds),

  // attribute management
  syncAttributes: (params?: QueryParams) =>
    ipcRenderer.invoke("attribute:sync", params),
  getAttributes: (params?: QueryParams) =>
    ipcRenderer.invoke("attribute:getAll", params),
  getAttribute: (id: string) => ipcRenderer.invoke("attribute:getById", { id }),
  createAttribute: (attributeData: CreateAttributeDto) =>
    ipcRenderer.invoke("attribute:create", attributeData),
  createAttributeWithTerms: (attributeData: CreateAttributeWithTermsDto) =>
    ipcRenderer.invoke("attributeWithTerms:create", attributeData),
  updateAttribute: (attributeData: UpdateAttributeDto) =>
    ipcRenderer.invoke("attribute:update", attributeData),
  deleteAttribute: async (id: { id: number }) =>
    await ipcRenderer.invoke("attribute:delete", id),
  batchDeleteAttributes: async (attributeIds: { ids: number[] }) =>
    await ipcRenderer.invoke("attribute:batchDelete", attributeIds),

  // attribute term management
  syncAttributeTerms: (params: {
    attributeId: number;
    queryParams: QueryParams;
  }) => ipcRenderer.invoke("attributeTerm:sync", params),
  getAttributeTerms: (params?: QueryParams) =>
    ipcRenderer.invoke("attributeTerm:getAll", params),
  getAttributeTermsByAttributeId: (params: {
    attributeId: number;
    queryParams: QueryParams;
  }) => ipcRenderer.invoke("attributeTerm:getByAttributeId", params),
  createAttributeTerm: (termData: CreateAttributeTermDto) =>
    ipcRenderer.invoke("attributeTerm:create", termData),
  updateAttributeTerm: (termData: UpdateAttributeTermDto) =>
    ipcRenderer.invoke("attributeTerm:update", termData),
  deleteAttributeTerm: async (id: { id: number }) =>
    await ipcRenderer.invoke("attributeTerm:delete", id),
  batchDeleteAttributeTerms: async (termIds: { ids: number[] }) =>
    await ipcRenderer.invoke("attributeTerm:batchDelete", termIds),
  batchUpdateProductAttributeTerms: (params: {
    attributeId: number;
    termsData: BatchUpdateAttributeTermsDto;
  }) => ipcRenderer.invoke("attributeTerm:batchUpdate", params),

  // tag management
  getTags: (params?: QueryParams) => ipcRenderer.invoke("tag:getAll", params),
  syncTags: (params?: QueryParams) => ipcRenderer.invoke("tag:sync", params),
  createTag: (tagData: { name: string; description?: string }) =>
    ipcRenderer.invoke("tag:create", tagData),
  updateTag: (tagData: { id: number; name: string; description?: string }) =>
    ipcRenderer.invoke("tag:update", tagData),
  deleteTag: async (id: { id: number }) =>
    await ipcRenderer.invoke("tag:delete", id),
  batchDeleteTags: async (tagIds: { ids: number[] }) =>
    await ipcRenderer.invoke("tag:batchDelete", tagIds),

  // client management
  getClients: (params?: QueryParams) =>
    ipcRenderer.invoke("client:getAll", params),
  createClient: (clientData: {
    name: string;
    type: "individual" | "company";
    phone: string;
    address: string;
    tva?: string | null;
  }) => ipcRenderer.invoke("client:create", clientData),
  updateClient: (clientData: {
    id: number;
    name?: string;
    type?: "individual" | "company";
    phone?: string;
    address?: string;
    tva?: string | null;
  }) => ipcRenderer.invoke("client:update", clientData),
  deleteClient: async (id: { id: number }) =>
    await ipcRenderer.invoke("client:delete", id),
  batchDeleteClients: async (clientIds: { ids: number[] }) =>
    await ipcRenderer.invoke("client:batchDelete", clientIds),

  // quote management
  getQuotes: (params?: any) => ipcRenderer.invoke("quote:getAll", params),
  getQuote: (id: number) => ipcRenderer.invoke("quote:getById", { id }),
  getQuotesByClient: (clientId: number) =>
    ipcRenderer.invoke("quote:getByClientId", { clientId }),
  createQuote: (quoteData: any) =>
    ipcRenderer.invoke("quote:create", quoteData),
  updateQuote: (quoteData: any) =>
    ipcRenderer.invoke("quote:update", quoteData),
  deleteQuote: async (id: { id: number }) =>
    await ipcRenderer.invoke("quote:delete", id),
  batchDeleteQuotes: async (ids: { ids: number[] }) =>
    await ipcRenderer.invoke("quote:batchDelete", ids),
  changeQuoteStatus: async (params: { id: number; status: string }) =>
    await ipcRenderer.invoke("quote:changeStatus", params),

  // invoice management
  getInvoices: (params?: QueryParams) =>
    ipcRenderer.invoke("invoice:getAll", params),
  getInvoice: (id: number) => ipcRenderer.invoke("invoice:getById", { id }),
  createInvoice: (invoiceData: any) =>
    ipcRenderer.invoke("invoice:create", invoiceData),
  createInvoiceFromQuote: (quoteId: number, additionalData?: any) =>
    ipcRenderer.invoke("invoice:createFromQuote", {
      quoteId,
      ...additionalData,
    }),
  updateInvoice: (invoiceData: any) =>
    ipcRenderer.invoke("invoice:update", invoiceData),
  deleteInvoice: async (id: { id: number }) =>
    await ipcRenderer.invoke("invoice:delete", id),
  batchDeleteInvoices: async (ids: { ids: number[] }) =>
    await ipcRenderer.invoke("invoice:batchDelete", ids),
  changeInvoiceStatus: async (params: { id: number; status: string }) =>
    await ipcRenderer.invoke("invoice:changeStatus", params),
  findInvoiceByQuote: (quoteId: number) =>
    ipcRenderer.invoke("invoice:findByQuote", { quoteId }),
  findOverdueInvoices: () => ipcRenderer.invoke("invoice:findOverdue"),
  validateInvoiceStock: (params: { products: any[] }) =>
    ipcRenderer.invoke("invoice:validateStock", params),

  // employee management
  getEmployees: (params?: EmployeeQueryDto) =>
    ipcRenderer.invoke("employee:getAll", params),
  createEmployee: (employeeData: CreateEmployeeDto) =>
    ipcRenderer.invoke("employee:create", employeeData),
  updateEmployee: (employeeData: UpdateEmployeeDto) =>
    ipcRenderer.invoke("employee:update", employeeData),
  deleteEmployee: async (id: { id: number }) =>
    await ipcRenderer.invoke("employee:delete", id),
  batchDeleteEmployees: async (data: { ids: number[] }) =>
    await ipcRenderer.invoke("employee:batchDelete", data),

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("auth", {
  login: (data: LoginProps) => ipcRenderer.invoke("auth:login", data),
  signup: (data: UserCreateDto) => ipcRenderer.invoke("auth:signup", data),
});
