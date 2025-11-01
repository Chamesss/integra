import { InvoiceService } from "../services/invoice.service";
import { CreateInvoiceDto, InvoiceStatus } from "../types/invoice.types";

export class InvoiceController {
  private invoiceService: InvoiceService;

  constructor() {
    this.invoiceService = new InvoiceService();
  }

  async create(data: CreateInvoiceDto) {
    return await this.invoiceService.create(data);
  }

  async createFromQuote(
    quoteId: number,
    additionalData?: Partial<CreateInvoiceDto>
  ) {
    return await this.invoiceService.createFromQuote(quoteId, additionalData);
  }

  async getAllInvoices(query: any) {
    return await this.invoiceService.getAllWithFilters(query);
  }

  async findById(id: number) {
    try {
      const invoice = await this.invoiceService.getById(id);
      return {
        success: true,
        data: invoice,
        message: "Invoice retrieved successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findByQuote(quoteId: number) {
    return await this.invoiceService.findByQuote(quoteId);
  }

  async findOverdue() {
    return await this.invoiceService.findOverdue();
  }

  async update(id: number, data: Partial<CreateInvoiceDto>) {
    try {
      const invoice = await this.invoiceService.update(id.toString(), data);
      return {
        success: true,
        data: invoice,
        message: "Invoice updated successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async changeStatus(id: number, status: InvoiceStatus) {
    return await this.invoiceService.changeStatus(id, status);
  }

  async delete(id: number) {
    try {
      await this.invoiceService.delete(id.toString());
      return {
        success: true,
        message: "Invoice deleted successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async validateStock(products: CreateInvoiceDto["products"]) {
    return await this.invoiceService.validateStock(products);
  }

  async batchDeleteInvoices(ids: number[]) {
    return this.invoiceService.batchDelete(ids);
  }
}
