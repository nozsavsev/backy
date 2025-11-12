import { rawControllersRegistry } from "./registry";
import { ActionMethod } from "./types";

export function Controller(path: string) {
  return function (target: any) {
    Reflect.defineMetadata("controller", path, target);
    rawControllersRegistry.push(target);
  };
}


export function HttpPost(name?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("httpMethod", "post", target, propertyKey);
    Reflect.defineMetadata("httpMethodName", name, target, propertyKey);
  };
}

export function HttpGet(name?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("httpMethod", "get", target, propertyKey);
    Reflect.defineMetadata("httpMethodName", name, target, propertyKey);
  };
}

export function HttpPut(name?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("httpMethod", "put", target, propertyKey);
    Reflect.defineMetadata("httpMethodName", name, target, propertyKey);
  };
}

export function HttpDelete(name?: string) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata("httpMethod", "delete", target, propertyKey);
    Reflect.defineMetadata("httpMethodName", name, target, propertyKey);
  };
}