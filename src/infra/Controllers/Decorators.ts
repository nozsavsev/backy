import { SERVICE_META_KEYS } from "../DI/Decorators";
import DIContainer from "../DI/DIContainer";
import { rawControllersRegistry } from "./Registry";
import { ActionMethod } from "./Types";

export const CONTROLLER_META_KEYS = {
  CONTROLLER_PATH: "controller_path",
  HTTP_METHOD: "httpMethod",
  HTTP_METHOD_NAME: "httpMethodName",
  AUTH_POLICIES: "authPolicies",
};

export function Controller(path: string) {
  return function (target: any) {
    Reflect.defineMetadata(CONTROLLER_META_KEYS.CONTROLLER_PATH, path, target);
    rawControllersRegistry.push(target);

    DIContainer.bind(target).toSelf().inSingletonScope();
  };
}

export function Authorize(policy?: string | string[]) {
  return function (target: any, propertyKey: string) {
    const policies =
      Reflect.getMetadata(
        CONTROLLER_META_KEYS.AUTH_POLICIES,
        target,
        propertyKey
      ) || [];

    if (policy && !policies.includes(policy)) {
      policies.push(policy);
    }

    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.AUTH_POLICIES,
      policies,
      target,
      propertyKey
    );
  };
}

export function HttpPost(name?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.HTTP_METHOD,
      "post",
      target,
      propertyKey
    );
    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.HTTP_METHOD_NAME,
      name,
      target,
      propertyKey
    );
  };
}

export function HttpGet(name?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.HTTP_METHOD,
      "get",
      target,
      propertyKey
    );
    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.HTTP_METHOD_NAME,
      name,
      target,
      propertyKey
    );
  };
}

export function HttpPut(name?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.HTTP_METHOD,
      "put",
      target,
      propertyKey
    );
    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.HTTP_METHOD_NAME,
      name,
      target,
      propertyKey
    );
  };
}

export function HttpDelete(name?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.HTTP_METHOD,
      "delete",
      target,
      propertyKey
    );
    Reflect.defineMetadata(
      CONTROLLER_META_KEYS.HTTP_METHOD_NAME,
      name,
      target,
      propertyKey
    );
  };
}
