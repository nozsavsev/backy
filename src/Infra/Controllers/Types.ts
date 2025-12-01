import { Request as ExpressRequest, Response as ExpressResponse } from "express";

export type ControllerDescriptor = {
  instance: any;
  path: string;
  actions: ActionDescriptor[];
};

export type ActionArgumentDescriptor = {
  name: string;
  type: string;
  source: "query" | "body";
  required: boolean;
};

export type ActionDescriptor = {
  name: string;
  method: ActionMethod;
  innerFunction: any;
  arguments: ActionArgumentDescriptor[];
};



export type ActionMethod = "get" | "post" | "put" | "delete";


export type RequestContext = {
  request: ExpressRequest;
  response: ExpressResponse;
  authz: any;
};