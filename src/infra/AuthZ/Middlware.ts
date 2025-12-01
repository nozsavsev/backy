import * as core from "express-serve-static-core";
import { DIContainer } from "..";
import UsersService from "../../server/services/UsersService";
import { AuthorizationContext } from "./Types";

export default function GetAuthContext(req: core.Request): AuthorizationContext {
  const userService = DIContainer.get(UsersService);

  const token = req.cookies[process.env.COOKIE_KEY!];

  console.log("getting auth context for token", token);

  if (!token) {
    return { user: null };
  }
  const user = userService.getUserFromToken(token);

  console.log("user from token", user);

  if (!user) {
    return { user: null };
  }
  return { user: user };
}
