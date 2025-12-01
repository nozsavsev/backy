import {
  Controller,
  HttpDelete,
  HttpGet,
  HttpPost,
  HttpPut,
} from "../../Infra/Controllers/Decorators";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import UsersService from "../services/UsersService";
import { RequestContext } from "../../Infra/Controllers/Types";

@Controller("/api/Users")
@injectable()
export default class UsersController {
  constructor(@inject(UsersService) public readonly UsersService: UsersService) {}


}
