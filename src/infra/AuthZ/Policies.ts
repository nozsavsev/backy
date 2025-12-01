import * as core from "express-serve-static-core";
import path from "path";
import DIContainer from "../DI/DIContainer";
import { rawPoliciesRegistry } from "./Registry";
import { PolicyDescriptor } from "./Types";
import { POLICY_META_KEYS } from "./Decorators";

export const policiesRegistry: PolicyDescriptor[] = [];

function registerPolicy(policyClass: any) {
  const policyName = Reflect.getMetadata(POLICY_META_KEYS.POLICY_NAME, policyClass);

  policiesRegistry.push({
    constructor: policyClass,
    name: policyName,
  });
}

export function mapPolicies() {
  rawPoliciesRegistry.forEach(registerPolicy);
  console.log("mapped policies", policiesRegistry, rawPoliciesRegistry);
}

export function getPolicy(name: string): PolicyDescriptor | undefined {
  console.log("getting policy", name, "from registry", policiesRegistry);
  return policiesRegistry.find((policy) => policy.name === name);
}