import { CoreRepo } from "../repositories/core.repo";
import { Category } from "../models";
import { CategoryService } from "../services/category.service";
import { QueryParams } from "../types/core.types";
import { CreateCategoryDto } from "../types/category.types";
import { CategoryRepo } from "../repositories/category.repo";

export class CategoryController {
  private categoryRepo: CoreRepo<Category>;
  private categoryService: CategoryService;

  constructor() {
    this.categoryRepo = new CategoryRepo();
    this.categoryService = new CategoryService(this.categoryRepo);
  }

  async syncAndGetCategories(queryParams: QueryParams) {
    return this.categoryService.syncCategoriesFromWoo(queryParams);
  }

  async createCategory(data: CreateCategoryDto) {
    return this.categoryService.create(data);
  }

  async deleteCategory(object: { id: number }) {
    const id = object.id;
    return this.categoryService.deleteCategory(id);
  }

  async batchDeleteCategories(object: { ids: number[] }) {
    const ids = object.ids;
    return this.categoryService.batchDelete(ids);
  }

  async updateCategory(data: CreateCategoryDto) {
    return this.categoryService.updateCategory(data);
  }
}
