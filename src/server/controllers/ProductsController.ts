import {
  Controller,
  HttpGet,
  HttpPost,
  HttpPut,
  HttpDelete,
} from "../../Infra/Controllers/Decorators";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import ProductsService from "../services/ProductsService";
@Controller("/api/Products")
@injectable()
export default class ProductsController {
  constructor(
    @inject(ProductsService) public readonly ProductsService: ProductsService
  ) {}

}
