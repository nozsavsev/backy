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

@Controller("/api/Users")
@injectable()
export default class UsersController {
  constructor(@inject(UsersService) public readonly UsersService: UsersService) {}

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
