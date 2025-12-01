This is a proposed skeleton; some parts are there as a placeholder, not implemented or ready for production yet.
judge the idea, not the specific details of the implementation.

src/infra/ contains the infrastructure code. All the decorators and DI container, and auth+z are here.
It's mostly clean, but there is some work to do, like proper docs, code organisation and deeper express integration that is much better than what I have now :/

src/server/ contains the server code. All the controllers, services, repositories and main.ts are here.
This is an example of how to use the infrastructure code.
it's dirty but working

In Postman or Insomnia you can make a login request:
post to `localhost:3000/api/AdminUsers/AddPermissionToUser`
with body:
```
{
   "userId": "john.doe@example.com",
	  "password": "password"
}
```
would give you elevated user with `manageUsers` permission

`jane.doe@example.com` with the same password gives you a regular user

You can fetch the current user on 
GET `localhost:3000/api/Users/CurrentUser`

and try making a request that requires a permission on 
POST `localhost:3000/api/AdminUsers/AddPermissionToUser`
with body 
```
{
   "userId": "john.doe@example.com",
	  "permission": "manageUsers"
}
```




Backend is separated into 4 layers:

- Middlware: handels Auth+z, Logging, etc.
- Controller: handles the request and response, incoming data validation and sanitization, outgoing error formatting, etc.
- Service: handles the business logic
- Repository: handles the data access and 3rd party integrations

## Data Models

For every data model there should be a DB_Model and DTO_Model.
with an auto mapper defined between them. (not yet defined but it is a well known package on npm that is easy to use)

- DB_Models is stored in a database and used internally
- DTO_Models are allowed to leave backend and be presented to a user and don't contain any sensetive data (like password hash or salt).

## Controllers

must be imported in main.ts so it will be bundled with the server.
will be automatically registered and mapped to the express when `mapControllers` is called.

To define a controller, define a class withan  attribute controller with the first argument being the path of the controller.

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
express request, response 
and auth+z context.

backy automatically creates an instance of a controller class and binds method to that intance before passing function to express as handler so you can use dependency injection and all resources in the class of your methods.

services can be obtained in the constructor of the controller using dependency injection.

```typescript
@Controller("/api/users")
export class UserController {
  constructor(@inject(UserService) public readonly UserService: UserService) {}
}
```

in plans are to implement argument parser that pulls data from request body, query, params, headers, etc. according to the types of the arguments.
decorators would be used to mark which data to pull, from where and how to parse it.
however for a clean syntax that would require a typoescript transformer which i need to research first.

along with that i plan to implement a way to set a return type of a method to be used as a response type for openapi generator.

## Services

must be imported in main.ts so it will be bundled with the server.

will be automatically registered and mapped to the express when `mapServices` is called if service is marked with @Service decorator.

if service is not marked with @Service decorator, it can be registered manually in main.ts binding concrete implementation to an abstract interface.

services must be registered BEFORE mapControllers is called

`RegisterImplementationService<IService>(
  identifier: ServiceIdentifier<IService>,
  implementation: Newable<IService>,
  lifetime: ServiceLifetime = "Transient"
)` function is used to register a service manually.

- Transient: _default_ DI Container creates a new instance of the service each time it is requested.
- Singleton: DI Container creates a single instance of the service and reuses it for all requests.
- Scoped: _not implemented yet_ DI Container creates a new instance of the service for each request.

__for now all services are singletons due to the initialization procedure of the controllers but it is fixable i jut didn't have time for that as it is a very small issue in the context of showing of the idea.__

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
    | "readProducts";
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

to define a policy: define a class with attribute `@Policy("policyName")` with first argument being the policy name.

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
```
}
```
all policies must be imported in main to be bundled with the server.


# notes

authZ is mocked, 
database is mocked (in memory array)
models are obviously not meant for production but rather for testing and prototyping.
i know that storing passwords in plaintext is bad ususally i use Argon2ID with per-user generated salt, which is an industry standard.

plans
in future i plan on making an auto-importer typoescript transformer that scans all the source files for needed decorators and imports needed files in main.ts automatically.
better code organization and express integration
proper service lifetime
and many more
