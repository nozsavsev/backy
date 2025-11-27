import { Service } from "../../Infra/DI/Decorators";
import { BaseRepository } from "../../Infra/Respository/BaseRepository";
import { DB_Product } from "../models/Product";
import { injectable } from "inversify";

@injectable()
@Service("Singleton")
export default class ProductRepository extends BaseRepository<DB_Product> {


}
