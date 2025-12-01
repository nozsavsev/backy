import { PermissionType } from "../../server/Auth/Permissions";
import { DB_User } from "../../server/models/User";
import * as core from "express-serve-static-core";

export type PolicyDescriptor = {
  constructor: any;
  name: string;
};

export type FailureReasonType = "Unauthorized" | "Forbidden" | PermissionType;

export type AuthorizationResult = {
  result: "OK" | "Error";
  failureReason: FailureReasonType[];
};

export type AuthorizationContext = {
  user: DB_User | null;
};

export class AuthorizationPolicy {
  public async handle(ctx: AuthorizationContext): Promise<AuthorizationResult> {
    return {
      result: "Error",
      failureReason: ["Unauthorized"],
    };
  }
}