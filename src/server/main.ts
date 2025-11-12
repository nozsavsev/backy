import "reflect-metadata";
import express from "express";

//import all controllers
import "../server/controllers/UserController";
import "../server/controllers/ProductsController";

//import all services
import "../server/services/UserService";

//import all repositories
import "../server/repositories/UserRepository";

import { mapControllers } from "../infra/controllers/controllers";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mapControllers(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
