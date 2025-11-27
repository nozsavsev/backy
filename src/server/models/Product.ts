import { v4 as uuidv4 } from "uuid";
import { IDBModel } from "../../Infra/Respository/BaseDBModel";

export class DB_Product implements IDBModel {
  public id: string = uuidv4();
  public name: string | null = null;
  public description: string | null = null;
  public price: number = 0;
}

export class DTO_Product {

  public constructor(product: DB_Product) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
  }

  public id: string = null!;
  public name: string | null = null;
  public description: string | null = null;
  public price: number = 0;
}
