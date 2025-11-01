import { CoreRepo } from "./core.repo";
import { Invoice } from "../models/invoice";

export class InvoiceRepo extends CoreRepo<Invoice> {
  constructor() {
    super(Invoice);
  }
}
