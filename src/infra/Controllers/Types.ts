export type ControllerDescriptor = {
  instance: any;
  path: string;
  actions: ActionDescriptor[];
};

export type ActionDescriptor = {
  name: string;
  method: ActionMethod;
  innerFunction: any;
  authRequirments: string[] | string;
};

export type ActionMethod = "get" | "post" | "put" | "delete";