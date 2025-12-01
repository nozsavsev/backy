import 'dotenv/config'


import "reflect-metadata";
import express from "express";

//import all controllers
import "./controllers/consolidate-import";

//import all services
import "./services/consolidate-import";

//import all repositories
import "./repositories/consolidate-import";

//import all policies
import "./Auth/consolidate-import";

import {
  DIContainer,
  mapControllers,
  RegisterDecoratedServices,
  RegisterImplementationService,
} from "../infra";
import {
  I_EMAIL_SERVICE_TOKEN,
  IEmailService,
} from "./services/Email/IEmailService";
import {
  SendGridEmailService,
  UsersAdminService,
  UsersService,
} from "./services/consolidate-import";
import { UsersController } from "./controllers/consolidate-import";
import AuthMiddleware from "../infra/AuthZ/Middlware";
import cookieParser from "cookie-parser";
import { mapPolicies } from "../infra/AuthZ/Policies";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

RegisterDecoratedServices();

RegisterImplementationService<IEmailService>(
  I_EMAIL_SERVICE_TOKEN,
  SendGridEmailService,
  "Singleton"
);


{
  const usersService = DIContainer.get(UsersService);
  let adminUser = usersService.registerUser("John Doe", "john.doe@example.com", "password", "1");
  usersService.registerUser("Jane Doe", "jane.doe@example.com", "password", "2");
  
  const adminusersService = DIContainer.get(UsersAdminService);
  adminusersService.addPermissionToUser(adminUser.id, "manageUsers");
}


mapControllers(app);

mapPolicies();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
