this is a proposed skeleton, some parts are there as a placeholder not implemented or ready for production yet.
judge the idea not specific details of the implementation.

src/infra/ contains the infrastructure code. all the decorators and DI container are here.

src/server/ contains the server code. all the controllers, services, repositories and main.ts are here.

this projects implements a sample server with:
 - user (register login logout delete update)
 - userAdmin (delete update)

 - product (read, filter)
 - productAdmin (CRUD)

# important:
authZ is mocked, 
database is mocked (in memory array)
models are obviously not meant for production but rather for testing and prototyping.
i know that storing passwords in plaintext is bad ususally i use Argon2ID with per-user generated salt, which is an industry standard.

the part with parameter parsing and validation is far from ideal and due to implications of typescript may never be, so there is a possibility that we couldn't use it in production.

anonymous body types are not supported.
anonymous return types are not supported.

Backend is separated into 4 layers:

- Middlware: handels Authz, Logging, etc.
- Controller: handles the request and response, incoming data validation and sanitization, outgoing error formatting, etc.
- Service: handles the business logic
- Repository: handles the data access and 3rd party integrations

## Data Models

For every data model there should be a DB_Model and DTO_Model.
with an auto mapper defined between them. (not implemented YET)

- DB_Models is stored in a database and used internally
- DTO_Models are allowed to leave backend and be presented to a user and don't contain any sensetive data.

## Controllers

must be imported in main.ts so it will be bundled with the server.
will be automatically registered and mapped to the express when `mapControllers` is called.

To define a controller define a class with attribute controller with first argument being the path of the controller.

API methods are defined with HttpGet, HttpPost, HttpPut, HttpDelete decorators.  
If no path provided, the method name is used as the path.  
Method path is always appended to controller path

```typescript
@Controller("/api/users")
@injectable()
export class UserController {
  constructor(@inject(UserService) public readonly UserService: UserService) {}

  @HttpGet("/")
  public getUsers(
    @query name: string,
    @query page: number,
    @query limit: number,
    ctx: Context
  ): Promise<UserDTO[]> {
    //available at /api/users GET
    return this.UserService.getUsers(name, page, limit);
  }

  @HttpPut("/")
  public updateUser(@body user: UserDTO, ctx: Context): Promise<UserDTO> {
    //available at /api/users/updateUser PUT
    return this.UserService.updateUser(user);
  }
}
```

eaach controller method marked with a Http{Method} decorator is a route handler.
it receives the:

- method arguments: that are read and parsed according to types from @body or @query
- ctx:Context object containing request, response and authz context.

return type must be specified for openapi generator to work.
_openapi generator is not implemented YET_

backy automatically creates an instance of a controller class and binds method to that intance before passing function to express as handler so you can use dependency injection and all resources in the class of your methods.

services can be obtained in the constructor of the controller using dependency injection.

```typescript
@Controller("/api/users")
export class UserController {
  constructor(@inject(UserService) public readonly UserService: UserService) {}
}
```

## Services

must be imported in main.ts so it will be bundled with the server.

will be automatically registered and mapped to the express when `mapServices` is called if service is marked with @Service decorator.

if service is not marked with @Service decorator, it can be registered manually in main.ts binding concrete implementation to an abstract interface.

`registerService<InterfaceName, ImplementationName>(Lifetime: "Singleton" | "Scoped")` function is used to register a service manually.

- Transient: _default_ DI Container creates a new instance of the service each time it is requested.
- Singleton: DI Container creates a single instance of the service and reuses it for all requests.
- Scoped: _not implemented yet_ DI Container creates a new instance of the service for each request.

Services are classes that contain the business logic.
marked with @injectable decorator to be consumed by controllers.
services utilize repositories to access the data and 3rd party APIs.

```typescript
@Service(lifetime: "Singleton")
@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) public readonly UserRepository: UserRepository
  ) {}
}
```

## Repositories

must be imported in main.ts so it will be bundled with the server.
are registered with infra as a service, with teh same decorators as services.

Repositories are classes that contain the data access and 3rd party integrations logic.
marked with @injectable decorator to be consumed by services.
repositories utilize databases and 3rd party APIs.

Data access services are inherited form BaseRepository class.
Base repository implements basic CRUD operations and universal caching.

```typescript
@injectable()
@Service()
export class UserRepository extends BaseRepository<DB_User> {
  constructor(
    @inject(DatabaseService) public readonly DatabaseService: DatabaseService
  ) {
    super(DatabaseService);
  }
}
```

_DatabaseService i don't know what we will use so i'll leave it as a placeholder_  
_please let's use prisma as database service_

if repository exposes 3rd party integrations:

create an abstract interface consumed by service and implemented by repository.

```typescript
export interface IEmailProvider {
  sendEmail(email: string, subject: string, body: string): Promise<void>;
}
```

implement the interface in the repository.

```typescript
@injectable()
export class EmailProvider implements IEmailProvider {
  sendEmail(email: string, subject: string, body: string): Promise<void> {
    return Promise.resolve();
  }
}
```

this way you can easily mock the 3rd party integration in tests and swap implementations when needed  
(oh shit DefaultEmailProvider doesn't want to work with us anymore).

## Middlware & AuthZ

Authentication middlware runs on every request determening if the request is authenticated and if so, it sets the authz context.

authz context is used by the controller (or authorization middlware in some cases) to determine if the user has access to the resource.
it contains the DB_User object.

for now let it be

```typescript
type DB_User = {
  id: string;
  email: string;
  permissions:
    | "manageUsers"
    | "manageProducts"
    | "manageOrders"
    | "manageUsers"
    | "manageProducts"
    | "manageOrders";
};
```

setting `@Authorize("policyName")` decorator on a controller method will check if the user has the required permissions to access the resource. and fail request if not.

```typescript
@HttpGet("/")
@Authorize("manageUsers")
public getUsers(@query name: string, @query page: number, @query limit: number, ctx: Context): Promise<UserDTO[]> {
  return this.UserService.getUsers(name, page, limit);
}
```

to define a policy: define a class with attribute policy with first argument being the policy name.

base class contains a `handle` method that is called to check if the user has the required permissions to access the resource.
it can be overridden to implement the policy logic.
base implementattion always fails the check for security reasons.

`handle` method returns object of type `AuthorizationResult` which contains the result of the check and a message.

```typescript
export type AuthorizationResult = {
  result: "OK" | "Error";
  failureReason: FailureReasonType;
};
```

FailureReasonType is an enum of possible failure reasons defined elsewhere.
i propose it contains all the permissions along with plain unauthorized, forbidden, etc...

to indicate specifically what permission is missing.

all policies applyed to the given method will be run independent of failures.
if any failure is detected, error report containing all failure reasons will be returned as a response with appropriate error code.

```typescript
@Policy("manageUsers")
@injectable()
export class ManageUsersPolicy extends AuthorizationPolicy {
  public override async handle(ctx: Context): Promise<AuthorizationResult> {
    if (ctx.authzContext.user.permissions.includes("manageUsers")) {
      return {
        result: "OK",
        failureReason: FailureReasonType.None,
      };
    }

    return {
      result: "Error",
      failureReason: FailureReasonType.manageUsers,
    };
  }
}
```

## Implementation details

inversify is used as DI container.
controllers are injectable cuz i need to get an instance to pass methods to express (and bind them)

scoped DI is not implemented yet because i need to research how to connect it to express. (scoped lifetime is supported by inversify but the idea is that services are created once per request. but i don't know how to do that with express. along with that for now since all deps are loaded on the creation of the controller intance all services are actually singletons (kinda) but it is solvable if nessesary)

services and repositories are registered as services with @Service decorator. (it's just a name of the decorator nothing more)
inside this decorator simply pushes them into an array to later be registered with inversify for future injections (in main ts).

controller decorators do the same thing but for controllers. also push them into an array to later be registered with express.
@Http{Get,Post,Put,Delete} decorators are used to define the HTTP method and path of the controller method. 
parm names and types are collected by ts transfromer and injected as parameters into tehse decorators compile time.
by default primitive types are treated as query parameters and other types are treated as body parameters.
only one body is allowed per method.
first argument is always context object that contains request, response and authz context.