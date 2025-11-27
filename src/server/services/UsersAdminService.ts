import { inject, injectable } from "inversify";
import { Service } from "../../Infra/DI/Decorators";
import UserRepository from "../repositories/UserRepository";

@Service("Transient")
@injectable()
  export default class UsersAdminService {

  constructor(
    @inject(UserRepository) public readonly UserRepository: UserRepository,
  ) {}
  
}
