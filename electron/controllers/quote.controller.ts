import { QuoteRepo } from "../repositories/quote.repo";
import { QuoteService } from "../services/quote.service";
import { QueryParams } from "../types/core.types";
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteQueryDto,
  QuoteStatus,
} from "../types/quote.types";

export class QuoteController {
  private quoteRepo: QuoteRepo;
  private quoteService: QuoteService;

  constructor() {
    this.quoteRepo = new QuoteRepo();
    this.quoteService = new QuoteService(this.quoteRepo);
  }

  async getAllQuotes(queryParams: QuoteQueryDto & QueryParams) {
    return this.quoteService.getAllWithFilters(queryParams);
  }

  async getQuoteById(params: { id: number }) {
    return this.quoteService.getByIdWithRelations(params.id);
  }

  async getQuotesByClientId(params: { clientId: number }) {
    return this.quoteService.getByClientId(params.clientId);
  }

  async createQuote(data: CreateQuoteDto) {
    return this.quoteService.create(data);
  }

  async updateQuote(data: UpdateQuoteDto) {
    return this.quoteService.updateQuote(data);
  }

  async deleteQuote(params: { id: number }) {
    return this.quoteService.deleteQuote(params.id);
  }

  async batchDeleteQuotes(params: { ids: number[] }) {
    return this.quoteService.batchDelete(params.ids);
  }

  async changeQuoteStatus(params: { id: number; status: QuoteStatus }) {
    return this.quoteService.changeStatus(params.id, params.status);
  }
}
