import * as core from "express-serve-static-core";
import path from "path";
import DIContainer from "../DI/DIContainer";
import { rawControllersRegistry } from "./Registry";
import {
  ActionArgumentDescriptor,
  ActionMethod,
  ControllerDescriptor,
  RequestContext,
} from "./Types";
import { Request, Response } from "express";

function getPrimitiveTypeName(type: any): string {
  if (type === String) return "string";
  if (type === Number) return "number";
  if (type === Boolean) return "boolean";
  if (type?.name) return type.name.toLowerCase();
  return "unknown";
}

function parseQueryValue(value: any, type?: string) {
  if (!type || type === "string") return value;

  if (type === "number") {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error("invalid number");
    }
    return parsed;
  }

  if (type === "boolean") {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    throw new Error("invalid boolean");
  }

  return value;
}

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

      const types = Reflect.getMetadata(
        "design:paramtypes",
        prototype,
        propertyName
      );

      console.log(Object.getOwnPropertyNames(new types[4]()));



      const params = (
        Reflect.getMetadata("method:params", prototype, propertyName) ||
        ([] as [])
      ).sort((a: any, b: any) => a.index - b.index);

      const argumentsList: ActionArgumentDescriptor[] = [];

      for (const param of params) {
        const paramType = types[param.index];
        argumentsList.push({
          name: param.name,
          type: getPrimitiveTypeName(paramType),
          source: param.source,
          required: param.required,
        });
      }

      if (argumentsList.filter((arg) => arg.source === "body").length > 1) {
        throw new Error("Only one body argument is allowed");
      }

      // console.log(argumentsList);

      controller.actions.push({
        name: name || propertyName,
        method: method,
        arguments: argumentsList,
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
        async (req: Request, res: Response) => {
          const ctx: RequestContext = {
            request: req,
            response: res,
            authz: {},
          };

          const args: any = {};

          //deal with query
          for (const arg of action.arguments.filter(
            (arg) => arg.source === "query"
          )) {
            if (!req.query[arg.name]) {
              if (arg.required) {
                return res
                  .status(400)
                  .json({ error: `${arg.name} is required` });
              }
              continue;
            }

            let parsedValue;
            try {
              parsedValue = parseQueryValue(req.query[arg.name], arg.type);
            } catch {
              return res
                .status(400)
                .json({ error: `${arg.name} must be a ${arg.type}` });
            }

            args[arg.name] = parsedValue;
          }


          await action.innerFunction(ctx, ...Object.values(args));
        }
      );
    });
  });
}
