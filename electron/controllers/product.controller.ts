import { Product } from "../models";
import { CoreRepo } from "../repositories/core.repo";
import { ProductService } from "../services/product.service";
import { ProductRepo } from "../repositories/product.repo";
import { QueryParams } from "../types/core.types";
import { CreateProductDto, UpdateProductDto } from "../types/product.types";

export class ProductController {
  private productRepo: CoreRepo<Product>;
  private productService: ProductService;

  constructor() {
    this.productRepo = new ProductRepo();
    this.productService = new ProductService(this.productRepo);
  }

  async syncAndGetProducts(queryParams: QueryParams) {
    return this.productService.syncProductsFromWoo(queryParams);
  }

  async getById(object: { id: number }) {
    const id = object.id;
    return this.productService.getProduct(id);
  }

  async createProduct(data: CreateProductDto) {
    return this.productService.create(data);
  }

  async deleteProduct(object: { id: number }) {
    const id = object.id;
    return this.productService.deleteProduct(id);
  }

  async batchDeleteProducts(object: { ids: number[] }) {
    const ids = object.ids;
    return this.productService.batchDelete(ids);
  }

  async updateProduct(data: UpdateProductDto) {
    return this.productService.updateProduct(data);
  }
}
