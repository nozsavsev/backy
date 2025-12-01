import {
    AuthorizationContext,
    AuthorizationPolicy,
    AuthorizationResult,
  } from "../../../infra/AuthZ/Types";
import { Policy } from "../../../infra/AuthZ/Decorators";
  
  @Policy("Authenticated")
  export class AuthenticatedPolicy extends AuthorizationPolicy {
    public override async handle(
      ctx: AuthorizationContext
    ): Promise<AuthorizationResult> {

      console.log("checking if user is authenticated", ctx.user);

      if (ctx.user) {
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
  