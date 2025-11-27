import { inject, injectable } from "inversify";
import { Service } from "../../Infra/DI/Decorators";
import ProductRepository from "../repositories/ProductRepository";

@Service("Transient")
@injectable()
export default class ProductsAdminService {
  constructor(
    @inject(ProductRepository)
    public readonly ProductRepository: ProductRepository
  ) {}
}
