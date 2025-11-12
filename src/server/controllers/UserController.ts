import {
  Controller,
  HttpDelete,
  HttpGet,
  HttpPost,
  HttpPut,
} from "../../infra/controllers/decorators";
import { Request, Response } from "express";
import UserService from "../services/UserService";
import { inject, injectable } from "inversify";

@Controller("/api/Users")
@injectable()
export default class UsersController {
  constructor(@inject(UserService) public readonly UserService: UserService) {}

  @HttpGet("GetAllUsers")
  public async GetAllUsers(req: Request, res: Response) {
    const users = await this.UserService.getAllUsers();
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
