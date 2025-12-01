import { v4 as uuidv4 } from "uuid";
import { IDBModel } from "../../infra/Respository/BaseDBModel";
import { PermissionType } from "../Auth/Permissions";

export class DB_User implements IDBModel {
  public id: string = uuidv4();
  public name: string | null = null;
  public email: string = null!;
  public password: string = null!;
  public permissions: PermissionType[] = [];
}

export class DTO_User {

  public constructor(user: DB_User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.permissions = user.permissions;
  }

  

  public id: string = null!;
  public email: string = null!;
  public name: string | null = null;
  public permissions: PermissionType[] = [];
}
