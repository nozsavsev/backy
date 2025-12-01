import { inject, injectable } from "inversify";
import { Service } from "../../infra/DI/Decorators";
import UserRepository from "../repositories/UserRepository";
import { PermissionType } from "../Auth/Permissions";

@Service("Transient")
@injectable()
  export default class UsersAdminService {

  constructor(
    @inject(UserRepository) public readonly UserRepository: UserRepository,
  ) {}
  
  public addPermissionToUser(userId: string, permission: PermissionType): void {
    const user = this.UserRepository.GetById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.permissions.push(permission);
    this.UserRepository.Update(user);
  }

  public removePermissionFromUser(userId: string, permission: PermissionType): void {
    const user = this.UserRepository.GetById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.permissions = user.permissions.filter((p) => p !== permission);
    this.UserRepository.Update(user);
  }

}
