import {
  Controller,
  HttpGet,
  HttpPost,
  HttpPut,
  HttpDelete,
  Query,
  Body,
} from "../../Infra/Controllers/Decorators";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import ProductsAdminService from "../services/ProductsAdminService";
import { RequestContext } from "../../Infra/Controllers/Types";
import GetAllProductsRequest from "./dto/GetAllProductsRequest";

@Controller("/api/Admin/Products")
@injectable()
export default class ProductsAdminController {
  constructor(
    @inject(ProductsAdminService)
    public readonly ProductsAdminService: ProductsAdminService
  ) {}

  @HttpPost("GetAllProducts")
  public async GetAllProducts(
    ctx: RequestContext,
    name?: string,
    page?: number,
    limit?: number,
    body?: GetAllProductsRequest
  ) {
    console.log("name", name);
    console.log("page", page);
    console.log("limit", limit);
    console.log("body", body);

    ctx.response.json({ message: "All products retrieved" });
  }
}
