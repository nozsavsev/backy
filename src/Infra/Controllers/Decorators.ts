import { rawControllersRegistry } from "./Registry";
import { ActionMethod } from "./Types";

export function Controller(path: string) {
  return function (target: any) {
    Reflect.defineMetadata("controller", path, target);
    rawControllersRegistry.push(target);
  };
}

export const META_HTTP_METHOD_KEY = "api:httpMethod";
export const META_HTTP_PATH_KEY = "api:httpPath";
export const META_HTTP_PARAM_NAMES_KEY = "api:paramNames";
export const META_HTTP_PARAM_SOURCES_KEY = "api:paramSources";

export type ParamDescriptor = {
  index: number;
  name: string;
  AllowedTypes: any[];
};


export function HttpPost(name?: string, params?: ParamDescriptor[]) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(META_HTTP_METHOD_KEY, "post", target, propertyKey);
    Reflect.defineMetadata(META_HTTP_PATH_KEY, name, target, propertyKey);

    console.log(params);
    
    
  };
}

export function HttpGet(name?: string, paramNames?: string[]) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(META_HTTP_METHOD_KEY, "get", target, propertyKey);
    Reflect.defineMetadata(META_HTTP_PATH_KEY, name, target, propertyKey);
    Reflect.defineMetadata(
      META_HTTP_PARAM_NAMES_KEY,
      paramNames,
      target,
      propertyKey
    );
  };
}

export function HttpPut(name?: string, paramNames?: string[]) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(META_HTTP_METHOD_KEY, "put", target, propertyKey);
    Reflect.defineMetadata(META_HTTP_PATH_KEY, name, target, propertyKey);
    Reflect.defineMetadata(
      META_HTTP_PARAM_NAMES_KEY,
      paramNames,
      target,
      propertyKey
    );
  };
}

export function HttpDelete(name?: string, paramNames?: string[]) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(META_HTTP_METHOD_KEY, "delete", target, propertyKey);
    Reflect.defineMetadata(META_HTTP_PATH_KEY, name, target, propertyKey);
    Reflect.defineMetadata(
      META_HTTP_PARAM_NAMES_KEY,
      paramNames,
      target,
      propertyKey
    );
  };
}

export function Query(
  name?: string,
  required: "optional" | "required" = "required"
) {
  return function (target: any, key: string, index: number) {
    const paramNames =
      Reflect.getMetadata(META_HTTP_PARAM_NAMES_KEY, target, key) || [];
    let list =
      Reflect.getMetadata(META_HTTP_PARAM_SOURCES_KEY, target, key) || [];

    if (list.length === 0)
      list = paramNames.map((name: string, _index: number) => ({
        index: _index,
        name,
        source: _index === index ? "query" : null, //null will be treated as acceptable default
        required: required === "optional" ? false : true,
      }));

    Reflect.defineMetadata(META_HTTP_PARAM_SOURCES_KEY, list, target, key);
  };
}

export function Body(
  name: string,
  required: "optional" | "required" = "required"
) {
  return function (target: any, key: string, index: number) {
    const list = Reflect.getMetadata("method:params", target, key) || [];
    list.push({
      index,
      name: name,
      source: "body",
      required: required === "optional" ? false : true,
    });

    Reflect.defineMetadata("method:params", list, target, key);
  };
}
