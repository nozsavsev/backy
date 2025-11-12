import { Container, inject, injectable } from "inversify";
import UserRepository from "../../server/repositories/UserRepository";
import UserService from "../../server/services/UserService";
import UsersController from "../../server/controllers/UserController";
import ProductsController from "../../server/controllers/ProductsController";

const container: Container = new Container();

//bind all services
container.bind(UserService).toSelf();

//bind all repositories
container.bind(UserRepository).toSelf();

//bind all controllers
container.bind(UsersController).toSelf();
container.bind(ProductsController).toSelf();

export default container;
