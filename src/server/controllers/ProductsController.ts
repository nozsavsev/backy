import {
  Controller,
  HttpGet,
  HttpPost,
  HttpPut,
  HttpDelete,
} from "../../infra/controllers/decorators";
import { Request, Response } from "express";
import { injectable } from "inversify";

@Controller("/api/Products")
@injectable()
export default class ProductsController {
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
