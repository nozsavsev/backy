import {
  Controller,
  HttpDelete,
  HttpGet,
  HttpPost,
  HttpPut,
} from "../../Infra/Controllers/Decorators";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import UsersAdminService from "../services/UsersAdminService";
import { RequestContext } from "../../Infra/Controllers/Types";

@Controller("/api/Admin/Users")
@injectable()
export default class UsersAdminController {
  constructor(
    @inject(UsersAdminService)
    public readonly UsersAdminService: UsersAdminService
  ) {}

}
