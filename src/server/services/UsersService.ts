import { inject, injectable } from "inversify";
import { Service } from "../../infra/DI/Decorators";
import UserRepository from "../repositories/UserRepository";
import { DB_User } from "../models/User";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

@Service("Transient")
@injectable()
export default class UsersService {

    constructor(
        @inject(UserRepository) public readonly UserRepository: UserRepository,
      ) {}
  
      
      public registerUser(name: string, email: string, password: string, id?: string): DB_User {

        const user = new DB_User();
        user.id = id ?? uuidv4();
        user.name = name;
        user.email = email;
        user.password = password;

        return this.UserRepository.Create(user);
      }

      public changePassword(id: string, currentPassword:string, password: string): DB_User {

        const user = this.UserRepository.GetById(id);
        if (!user) {
          throw new Error("User not found");
        }

        if (user.password !== currentPassword) {
          throw new Error("Invalid current password");
        }

        user.password = password;

        return this.UserRepository.Update(user);
      }

      public getSessionToken_passwordEmail(password: string, email: string): string | undefined {
        const user = this.UserRepository.Query((user) => user.email === email && user.password === password);

        if (!user) {
          return undefined;
        }
        return jwt.sign({ id: user[0].id }, process.env.JWT_SECRET!);
      }

      public getUserFromToken(token: string): DB_User | undefined {
       try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET!);
      } catch (error) {
        return undefined;
      }
        if (!decoded) {
          return undefined;
        }

        return this.UserRepository.GetById((decoded as any).id as string);
      }

      public deleteUser(id: string): void {
        this.UserRepository.Delete(id);
      }

      public getAllUsers(): DB_User[] {
        return this.UserRepository.Query((user) => true);
      }

      public getUserById(id: string): DB_User | undefined {
        return this.UserRepository.GetById(id);
      }

}
