import User from "../models/User";
import { inject, injectable } from "inversify";
import UserRepository from "../repositories/UserRepository";

@injectable()
export default class UserService {
  constructor(
    @inject(UserRepository) public readonly UserRepository: UserRepository
  ) {}

  public async getAllUsers(): Promise<User[]> {
    console.log("getAllUsers from service");
    return this.UserRepository.getAllUsers();
  }
}
