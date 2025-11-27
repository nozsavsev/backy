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

@Controller("/api/Users")
@injectable()
export default class UsersAdminController {
  constructor(
    @inject(UsersAdminService)
    public readonly UsersAdminService: UsersAdminService
  ) {}

  @HttpGet("GetAllUsers")
  public async GetAllUsers(req: Request, res: Response) {
    res.json({ message: "All users retrieved" });
  }

  @HttpPost()
  public async NewUser(req: Request, res: Response) {
    res.json({ message: "New user created" });
  }

  @HttpPut()
  public async UpdateUser(req: Request, res: Response) {
    res.json({ message: "User updated" });
  }

  @HttpDelete()
  public async DeleteUser(req: Request, res: Response) {
    res.json({ message: "User deleted" });
  }
}
