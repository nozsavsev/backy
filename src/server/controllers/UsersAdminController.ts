import {
  Authorize,
  Controller,
  HttpDelete,
  HttpGet,
  HttpPost,
  HttpPut,
} from "../../infra/Controllers/Decorators";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import UsersAdminService from "../services/UsersAdminService";
import { AuthorizationContext } from "../../infra/AuthZ/Types";

@Controller("/api/AdminUsers")
@injectable()
export default class UsersAdminController {
  constructor(
    @inject(UsersAdminService)
    public readonly UsersAdminService: UsersAdminService
  ) {}

 
  @HttpPost("AddPermissionToUser")
  @Authorize("ManageUsers")
  public async AddPermissionToUser(req: Request, res: Response, ctx: AuthorizationContext) {
    const { userId, permission } = req.body;
    
    
    console.log("adding permission to user", userId, permission);

    res.json({ message: "Permission added to user" });
  }

  @HttpDelete("RemovePermissionFromUser")
  @Authorize("ManageUsers")
  public async RemovePermissionFromUser(req: Request, res: Response, ctx: AuthorizationContext) {
    const { userId, permission } = req.body;
     
    console.log("removing permission from user", userId, permission);

    res.json({ message: "Permission removed from user" });
  }
}
