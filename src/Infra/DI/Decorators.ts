import { rawServicesRegistry } from "./Registry";
import { ServiceLifetime } from "./Types";


export function Service(lifetime: ServiceLifetime = "Transient") {
  return function (target: any) {
    Reflect.defineMetadata("ServiceLifetime", lifetime, target);
    rawServicesRegistry.push(target);
  };
}
