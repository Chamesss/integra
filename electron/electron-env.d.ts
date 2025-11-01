/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: {
    on: typeof import("electron").ipcRenderer.on;
    off: typeof import("electron").ipcRenderer.off;
    send: typeof import("electron").ipcRenderer.send;
    invoke: typeof import("electron").ipcRenderer.invoke;
    getUser: (token: string) => Promise<any>;

    // category management
    getCategories: (params?: any) => Promise<any>;
    getCategory: (id: number) => Promise<any>;
    createCategory: (categoryData: any) => Promise<any>;
    updateCategory: (categoryData: any) => Promise<any>;
    deleteCategory: (id: { id: number }) => Promise<any>;
    batchDeleteCategories: (categoryIds: number[]) => Promise<any>;

    // product management
    getProducts: (params?: any) => Promise<any>;
    getProduct: (id: number) => Promise<any>;
    createProduct: (productData: any) => Promise<any>;
    updateProduct: (productData: any) => Promise<any>;
    deleteProduct: (id: { id: number }) => Promise<any>;
    batchDeleteProducts: (productIds: number[]) => Promise<any>;

    // attribute management
    syncAttributes: (params?: any) => Promise<any>;
    getAttributes: (params?: any) => Promise<any>;
    getAttribute: (id: string) => Promise<any>;
    createAttribute: (attributeData: any) => Promise<any>;
    createAttributeWithTerms: (attributeData: any) => Promise<any>;
    updateAttribute: (attributeData: any) => Promise<any>;
    deleteAttribute: (id: { id: number }) => Promise<any>;
    batchDeleteAttributes: (attributeIds: { ids: number[] }) => Promise<any>;

    // attribute term management
    syncAttributeTerms: (params: {
      attributeId: number;
      queryParams: any;
    }) => Promise<any>;
    getAttributeTerms: (params?: any) => Promise<any>;
    getAttributeTermsByAttributeId: (params: {
      attributeId: number;
      queryParams: any;
    }) => Promise<any>;
    createAttributeTerm: (termData: any) => Promise<any>;
    updateAttributeTerm: (termData: any) => Promise<any>;
    deleteAttributeTerm: (id: { id: number }) => Promise<any>;
    batchDeleteAttributeTerms: (termIds: { ids: number[] }) => Promise<any>;
    batchUpdateProductAttributeTerms: (params: {
      attributeId: number;
      termsData: any;
    }) => Promise<any>;

    // tag management
    getTags: (params?: any) => Promise<any>;
    syncTags: (params?: any) => Promise<any>;
    createTag: (tagData: {
      name: string;
      description?: string;
    }) => Promise<any>;
    updateTag: (tagData: {
      id: number;
      name: string;
      description?: string;
    }) => Promise<any>;
    deleteTag: (id: { id: number }) => Promise<any>;
    batchDeleteTags: (tagIds: { ids: number[] }) => Promise<any>;

    // client management
    getClients: (params?: any) => Promise<any>;
    createClient: (clientData: any) => Promise<any>;
    updateClient: (clientData: any) => Promise<any>;
    deleteClient: (id: { id: number }) => Promise<any>;
    batchDeleteClients: (clientIds: { ids: number[] }) => Promise<any>;

    // quote management
    getQuotes: (params?: any) => Promise<any>;
    getQuote: (id: number) => Promise<any>;
    getQuotesByClient: (clientId: number) => Promise<any>;
    createQuote: (quoteData: any) => Promise<any>;
    updateQuote: (quoteData: any) => Promise<any>;
    deleteQuote: (id: { id: number }) => Promise<any>;
    batchDeleteQuotes: (ids: { ids: number[] }) => Promise<any>;
    changeQuoteStatus: (params: { id: number; status: string }) => Promise<any>;

    // invoice management
    getInvoices: (params?: any) => Promise<any>;
    getInvoice: (id: number) => Promise<any>;
    createInvoice: (invoiceData: any) => Promise<any>;
    createInvoiceFromQuote: (
      quoteId: number,
      additionalData?: any
    ) => Promise<any>;
    updateInvoice: (invoiceData: any) => Promise<any>;
    deleteInvoice: (id: { id: number }) => Promise<any>;
    changeInvoiceStatus: (params: {
      id: number;
      status: string;
    }) => Promise<any>;
    findInvoiceByQuote: (quoteId: number) => Promise<any>;
    findOverdueInvoices: () => Promise<any>;
    validateInvoiceStock: (params: { products: any[] }) => Promise<any>;
  };
  auth: {
    login: (data: any) => Promise<any>;
    signup: (data: any) => Promise<any>;
  };
}
