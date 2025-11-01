import { Category } from "../models";
import { CoreRepo } from "./core.repo";

export class CategoryRepo extends CoreRepo<Category> {
  constructor() {
    super(Category);
  }
}
