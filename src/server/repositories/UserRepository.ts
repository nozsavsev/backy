import User from "../models/User";
import { injectable } from "inversify";

//should implement generic repository that has generic chache and database connector along with basic actions as get by id, update, delete
@injectable()
export default class UserRepository {
  private users: User[] = [];

  public async getAllUsers(): Promise<User[]> {
    console.log("getAllUsers from repository");
    return this.users;
  }
}
