import { inject, injectable } from "inversify";
import { Service } from "../../Infra/DI/Decorators";
import ProductRepository from "../repositories/ProductRepository";
import { I_EMAIL_SERVICE_TOKEN, IEmailService } from "./Email/IEmailService";

@Service("Transient")
@injectable()
export default class ProductsService {

    constructor(
        @inject(ProductRepository) public readonly ProductRepository: ProductRepository,
    ) {}
  

}
