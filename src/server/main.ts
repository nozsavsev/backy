import "reflect-metadata";
import express from "express";

//import all controllers
import "./controllers/UsersController";
import "./controllers/ProductsController";
import "./controllers/ProductsAdminController";
import "./controllers/UsersAdminController";

//import all services
import "./services/UsersService";
import "./services/ProductsService";
import "./services/ProductsAdminService";
import "./services/UsersAdminService";

//import all email services
import "./services/Email/AmazonSESEmailService";
import "./services/Email/SendgridEmailService";

//import all repositories
import "./repositories/UserRepository";
import "./repositories/ProductRepository";

import { mapControllers } from "../Infra/Controllers/Controllers";
import DIContainer, {
  RegisterDecoratedServices,
  RegisterImplementationService,
} from "../Infra/DI/DIContainer";
import { AmazonSESEmailService } from "./services/Email/AmazonSESEmailService";
import {
  I_EMAIL_SERVICE_TOKEN,
  IEmailService,
} from "./services/Email/IEmailService";
import { SendGridEmailService } from "./services/Email/SendgridEmailService";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

RegisterDecoratedServices();

RegisterImplementationService<IEmailService>(
  I_EMAIL_SERVICE_TOKEN,
  SendGridEmailService,
  "Singleton"
);

mapControllers(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

