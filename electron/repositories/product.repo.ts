import { CoreRepo } from "./core.repo";
import { Product } from "../models";

export class ProductRepo extends CoreRepo<Product> {
  constructor() {
    super(Product);
  }
}
