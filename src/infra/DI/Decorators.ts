import { rawServicesRegistry } from "./Registry";
import { ServiceLifetime } from "./Types";

export const SERVICE_META_KEYS = {
  SERVICE_LIFETIME: "ServiceLifetime",
};

export function Service(lifetime: ServiceLifetime = "Transient") {
  return function (target: any) {
    Reflect.defineMetadata(SERVICE_META_KEYS.SERVICE_LIFETIME, lifetime, target);
    rawServicesRegistry.push(target);
  };
}
