import {
  AuthorizationContext,
  AuthorizationPolicy,
  AuthorizationResult,
} from "../../../infra/AuthZ/Types";
import { Policy } from "../../../infra/AuthZ/Decorators";

@Policy("ManageUsers")  
export class ManageUsersPolicy extends AuthorizationPolicy {
  public override async handle(
    ctx: AuthorizationContext
  ): Promise<AuthorizationResult> {
    if (ctx.user && ctx.user?.permissions.includes("manageUsers")) {
      return {
        result: "OK",
        failureReason: [],
      };
    } else {
      return {
        result: "Error",
        failureReason: ["Unauthorized"],
      };
    }
  }
}
