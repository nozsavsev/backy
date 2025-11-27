import * as core from "express-serve-static-core";
import path from "path";
import DIContainer from "../DI/DIContainer";
import { rawControllersRegistry } from "./Registry";
import { ActionMethod, ControllerDescriptor } from "./Types";

export const controllersRegistry: ControllerDescriptor[] = [];

function registerController(controllerClass: any) {
  const controllerPath = Reflect.getMetadata("controller", controllerClass);

  DIContainer.bind(controllerClass).toSelf().inSingletonScope();

  const controller: ControllerDescriptor = {
    instance: DIContainer.get(controllerClass),
    path: controllerPath,
    actions: [],
  };

  const prototype = controllerClass.prototype;
  const propertyNames = Object.getOwnPropertyNames(prototype);

  for (const propertyName of propertyNames) {
    if (propertyName === "constructor") continue;

    const descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);

    if (descriptor && typeof descriptor.value === "function") {
      const method = Reflect.getMetadata(
        "httpMethod",
        prototype,
        propertyName
      ) as ActionMethod | undefined;

      const name = Reflect.getMetadata(
        "httpMethodName",
        prototype,
        propertyName
      );

      if (!method) continue;

      controller.actions.push({
        name: name || propertyName,
        method: method,
        innerFunction: controller.instance[propertyName].bind(
          controller.instance
        ),
      });
    }
  }

  controllersRegistry.push(controller);
}

export function mapControllers(server: core.Express) {
  rawControllersRegistry.forEach(registerController);

  controllersRegistry.forEach((controller) => {
    controller.actions.forEach((action) => {
      server[action.method](
        path.posix.join(controller.path, action.name),
        action.innerFunction
      );
    });
  });
}
