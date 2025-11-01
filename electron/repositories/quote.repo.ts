import { CoreRepo } from "./core.repo";
import { Quote } from "../models/quote";

export class QuoteRepo extends CoreRepo<Quote> {
  constructor() {
    super(Quote);
  }
}
