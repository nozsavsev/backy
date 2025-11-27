import {
  Container,
  inject,
  injectable,
  Newable,
  ServiceIdentifier,
} from "inversify";
import { ServiceLifetime } from "./Types";
import { rawServicesRegistry } from "./Registry";

const DIContainer: Container = new Container();

/**
 * Register a service with the DI container.
 * @param service - The service to register.
 * @param lifetime - The lifetime of the service.
 */
export function RegisterService(
  service: ServiceIdentifier<unknown>,
  lifetime: ServiceLifetime = "Transient"
) {
  if (lifetime === "Singleton") {
    DIContainer.bind(service).toSelf().inSingletonScope();
  } else {
    DIContainer.bind(service).toSelf().inTransientScope();
  }
}

/**
 * Register an implementation of a service with the DI container.
 * @param implementation - The implementation to register.
 * @param lifetime - The lifetime of the implementation.
 */
export function RegisterImplementationService<IService>(
  identifier: ServiceIdentifier<IService>,
  implementation: Newable<IService>,
  lifetime: ServiceLifetime = "Transient"
) {
  if (lifetime === "Singleton") {
    DIContainer.bind(identifier).to(implementation).inSingletonScope();
  } else {
    DIContainer.bind(identifier).to(implementation).inTransientScope();
  }
}

export function RegisterDecoratedServices() {
  rawServicesRegistry.forEach((service) => {
    const lifetime = Reflect.getMetadata("ServiceLifetime", service);
    RegisterService(service, lifetime);
  });
}

export default DIContainer;
