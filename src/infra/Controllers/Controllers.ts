import * as core from "express-serve-static-core";
import path from "path";
import DIContainer from "../DI/DIContainer";
import { rawControllersRegistry } from "./Registry";
import { ActionMethod, ControllerDescriptor } from "./Types";
import { CONTROLLER_META_KEYS } from "./Decorators";
import GetAuthContext from "../AuthZ/Middlware";
import { getPolicy } from "../AuthZ/Policies";

export const controllersRegistry: ControllerDescriptor[] = [];

function registerController(controllerClass: any) {
  const controllerPath = Reflect.getMetadata(
    CONTROLLER_META_KEYS.CONTROLLER_PATH,
    controllerClass
  );

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
        CONTROLLER_META_KEYS.HTTP_METHOD,
        prototype,
        propertyName
      ) as ActionMethod | undefined;

      const name = Reflect.getMetadata(
        CONTROLLER_META_KEYS.HTTP_METHOD_NAME,
        prototype,
        propertyName
      );

      if (!method) continue;

      controller.actions.push({
        name: name || propertyName,
        method: method,
        authRequirments:
          (Reflect.getMetadata(
            CONTROLLER_META_KEYS.AUTH_POLICIES,
            prototype,
            propertyName
          ) as string[] | string) ?? [],
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
      console.log(
        `[${action.method}] ${path.posix.join(controller.path, action.name)}`
      );

      server[action.method](
        path.posix.join(controller.path, action.name),
        async (req: core.Request, res: core.Response) => {
          const authContext = GetAuthContext(req);

          console.log("auth context", authContext);

          for (const requirment of action.authRequirments) {
            if (typeof requirment === "string") {
              //a single policy we need to check

              let policy = getPolicy(requirment);

              if (!policy) {
                return res
                  .status(500)
                  .json({
                    message:
                      "Internal server error, no policy found for " +
                      requirment,
                  });
              }

              let instance = new policy.constructor();
              let result = await instance.handle(authContext);
              if (result.result === "Error") {
                return res.status(403).json({ message: result.failureReason });
              } else {
                //policy passed
                break;
              }
            } else if (Array.isArray(requirment)) {
              //a list of policies we need to check
              for (const policyName of requirment as string[]) {
                let policy = getPolicy(policyName);
                if (!policy) {
                  return res
                    .status(500)
                    .json({ message: "Internal server error" });
                }
                let instance = new policy.constructor();
                let result = await instance.handle(authContext);
                if (result.result === "Error") {
                  return res
                    .status(403)
                    .json({ message: result.failureReason });
                }
              }
              //every policy passed
              break;
            } else {
              return res.status(500).json({ message: "Internal server error" });
            }
          }

          try {
            return await action.innerFunction(req, res, authContext).catch((error: any) => {
              return res.status(500).json({ message: "Internal server error" });
            });
          } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
          }
        }
      );
    });
  });
}
