import {
  Controller,
  HttpGet,
  HttpPost,
  HttpPut,
  HttpDelete,
} from "../../Infra/Controllers/Decorators";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import ProductsAdminService from "../services/ProductsAdminService";

@Controller("/api/Products")
@injectable()
export default class ProductsAdminController {

  constructor(@inject(ProductsAdminService) public readonly ProductsAdminService: ProductsAdminService) {}

  @HttpGet()
  public async GetAllProducts(req: Request, res: Response) {
    res.json({ message: "All products retrieved" });
  }

  @HttpPost()
  public async NewProduct(req: Request, res: Response) {
    res.json({ message: "New product created" });
  }

  @HttpPut()
  public async UpdateProduct(req: Request, res: Response) {
    res.json({ message: "Product updated" });
  }

  @HttpDelete()
  public async DeleteProduct(req: Request, res: Response) {
    res.json({ message: "Product deleted" });
  }
}
