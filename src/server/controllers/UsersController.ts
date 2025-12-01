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
import UsersService from "../services/UsersService";
import { DTO_User } from "../models/User";
import { AuthorizationContext } from "../../infra/AuthZ/Types";

@Controller("/api/Users")
@injectable()
export default class UsersController {
  constructor(
    @inject(UsersService) public readonly UsersService: UsersService
  ) {}

  @HttpGet("CurrentUser")
  @Authorize("Authenticated")
  public async GetCurrentUser(req: Request, res: Response, ctx: AuthorizationContext) {
    res.json({ user: new DTO_User(ctx.user!) });
  }

  @HttpPost("Login")
  public async LoginUser(req: Request, res: Response, ctx: AuthorizationContext) {
    const { email, password } = req.body;

    const token = this.UsersService.getSessionToken_passwordEmail(
      password,
      email
    );

    res.cookie(process.env.COOKIE_KEY!, token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.json({ message: "Logged in successfully" });
  }

  @HttpPost("Register")
  public async RegisterUser(req: Request, res: Response, ctx: AuthorizationContext) {
    const { name, email, password } = req.body;

    const user = this.UsersService.registerUser(name, email, password);

    res.json({ user: new DTO_User(user) });
  }
}
