import { Service } from "../../infra/DI/Decorators";
import { BaseRepository } from "../../infra/Respository/BaseRepository";
import { DB_User } from "../models/User";
import { injectable } from "inversify";

@injectable()
@Service("Singleton")
export default class UserRepository extends BaseRepository<DB_User> {



}
