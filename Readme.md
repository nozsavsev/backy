This is a proposed skeleton; some parts are there as a placeholder, not implemented or not ready for production yet.
Judge the idea, not the specific details of the implementation.

`src/infra/` contains the infrastructure code. All the decorators and DI container, and AuthZ are here.
It's mostly clean, but there is some work to do, like proper docs, code organisation and deeper express integration that is much better than what I have now :/

`src/server/` contains the server code. All the controllers, services, repositories and main.ts are here.
This is an example of how to use the infrastructure code.
It's dirty but working

In Postman or Insomnia, you can make a login request:
POST to `localhost:3000/api/AdminUsers/AddPermissionToUser`
with body:
```
{
   "userId": "john.doe@example.com",
	  "password": "password"
}
```
Would give you an elevated user with `manageUsers` permission

`jane.doe@example.com` with the same password gives you a regular user

You can fetch the current user on 
GET `localhost:3000/api/Users/CurrentUser`

And try making a request that requires a permission on 
POST `localhost:3000/api/AdminUsers/AddPermissionToUser`
with body 
```
{
   "userId": "john.doe@example.com",
	  "permission": "manageUsers"
}
```




Backend is separated into 4 layers:

- Middleware: handles AuthZ, Logging, etc. _logging is not implemented, as well as unified error handling, and auth is not properly integrated with express YET_
- Controller: handles the request and response, incoming data validation and sanitisation, outgoing error formatting, etc. _in theory rn I didn't do any validation because of time constraints_
- Service: handles the business logic
- Repository: handles the data access and 3rd party integrations _see currently unused `emailService`_

## Data Models

For every data model, there should be a DB_Model and a DTO_Model.
With an auto mapper defined between them. (not yet defined, but it is a well-known package on npm that is easy to use)

- DB_Models are stored in a database and used internally
- DTO_Models are allowed to leave the backend and be presented to a user, and don't contain any sensitive data (like password hash or salt).

## Controllers

Must be imported in main.ts so it will be bundled with the server.
Will be automatically registered and mapped to the express when `mapControllers` is called.

To define a controller, define a class with an attribute named controller, where the first argument is the controller's path.

API methods are defined using the HttpGet, HttpPost, HttpPut, and HttpDelete decorators.  
If no path is provided, the method name is used as the path.  
Method path is always appended to the controller path

```typescript
@Controller("/api/users")
@injectable()
export class UserController {
  constructor(@inject(UserService) public readonly UserService: UserService) {}

  @HttpGet("/")
  public getUsers(
    req: core.Request, res: core.Response
    ctx: Context
  ): Promise<UserDTO[]> {
    //available at /api/users GET
    return this.UserService.getUsers(args);
  }

  @HttpPut("/")
  public updateUser(req: core.Request, res: core.Response ctx: Context): Promise<UserDTO> {
    //available at /api/users/updateUser PUT
    return this.UserService.updateUser(args);
  }
}
```

Each controller method marked with a Http{Method} decorator is a route handler.
It receives the:
express request, response 
and AuthZ context.

Backy automatically creates an instance of a controller class and binds method to that instance before passing function to express as handler so you can use dependency injection and all resources in the class of your methods.

Services can be obtained in the constructor of the controller using dependency injection.

```typescript
@Controller("/api/users")
export class UserController {
  constructor(@inject(UserService) public readonly UserService: UserService) {}
}
```

Plans are to implement argument parser that pulls data from request body, query, params, headers, etc., according to the types of the arguments.
Decorators would be used to mark which data to pull, from where and how to parse it.
However, for a clean syntax that would require a TypeScript transformer, which I need to develop first.

Along with that, I plan to implement a way to set a return type of a method to be used as a response type for OpenAPI generator.

## Services

Must be imported in main.ts so it will be bundled with the server.

Will be automatically registered and mapped to the express when `mapServices` is called if service is marked with @Service decorator.

If service is not marked with @Service decorator, it can be registered manually in main.ts binding concrete implementation to an abstract interface.

Services must be registered BEFORE mapControllers is called

`RegisterImplementationService<IService>(
  identifier: ServiceIdentifier<IService>,
  implementation: Newable<IService>,
  lifetime: ServiceLifetime = "Transient"
)` 
function is used to register a service manually.

- Transient: _default_ DI Container creates a new instance of the service each time it is requested.
- Singleton: DI Container creates a single instance of the service and reuses it for all requests.
- Scoped: _not implemented yet_ DI Container creates a new instance of the service for each request.

__for now all services are singletons due to the initialization procedure of the controllers but it is fixable, I just didn't have time for that as it is a very small issue in the context of showing the idea.__

Services are classes that contain the business logic.
Marked with @injectable decorator to be consumed by controllers.
Services utilize repositories to access the data and 3rd party APIs.

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

Must be imported in main.ts so it will be bundled with the server.
Are registered with infra as a service, with the same decorators as services.

Repositories are classes that contain the data access and 3rd party integrations logic.
Marked with @injectable decorator to be consumed by services.
Repositories utilize databases and 3rd party APIs.

Data access services are inherited from BaseRepository class.
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

_DatabaseService I don't know what we will use so I'll leave it as a placeholder_  
_please let's use prisma as database service_

If repository exposes 3rd party integrations:

Create an abstract interface consumed by service and implemented by repository.

```typescript
export interface IEmailProvider {
  sendEmail(email: string, subject: string, body: string): Promise<void>;
}
```

Implement the interface in the repository.

```typescript
@injectable()
export class EmailProvider implements IEmailProvider {
  sendEmail(email: string, subject: string, body: string): Promise<void> {
    return Promise.resolve();
  }
}
```

This way you can easily mock the 3rd party integration in tests and swap implementations when needed  
(oh shit DefaultEmailProvider doesn't want to work with us anymore).

## Middleware & AuthZ

Authentication middleware runs on every request determining if the request is authenticated and if so, it sets the AuthZ context.

AuthZ context is used by the controller (or authorization middleware in some cases) to determine if the user has access to the resource.
It contains the DB_User object.

for now let it be

```typescript
type DB_User = {
  id: string;
  email: string;
  permissions:
    | "manageUsers";
};
```

Setting `@Authorize("policyName")` decorator on a controller method will check if the user has the required permissions to access the resource. And fail request if not.

```typescript
@HttpGet("/")
@Authorize("manageUsers")
public getUsers(req: core.Request, res: core.Response ctx: Context): Promise<UserDTO[]> {
  return this.UserService.getUsers(args);
}
```

To define a policy: define a class with attribute `@Policy("policyName")` with first argument being the policy name.

Base class contains a `handle` method that is called to check if the user has the required permissions to access the resource.
It can be overridden to implement the policy logic.
Base implementation always fails the check for security reasons.

`handle` method returns an object of type `AuthorizationResult` which contains the result of the check and a message.

```typescript
export type AuthorizationResult = {
  result: "OK" | "Error";
  failureReason: FailureReasonType;
};
```

FailureReasonType is an enum of possible failure reasons defined elsewhere.
I propose it contains all the permissions along with plain unauthorized, forbidden, etc...

To indicate specifically what permission is missing.

All policies applied to the given method will be run independent of failures.
If any failure is detected, error report containing all failure reasons will be returned as a response with appropriate error code.

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

All policies must be imported in main to be bundled with the server.


# Notes

AuthZ is mocked, 
database is mocked (in memory array)
models are obviously not meant for production but rather for testing and prototyping.
I know that storing passwords in plaintext is bad usually I use Argon2ID with per-user generated salt, which is an industry standard.
Some other stuff that concerns you but I forgot to write it down here :/

Plans
In future I plan on making an auto-importer TypeScript transformer that scans all the source files for needed decorators and imports needed files in main.ts automatically.
Proper service lifetime
and a lot more
