
import { rawPoliciesRegistry } from "./Registry";

export const POLICY_META_KEYS = {
  POLICY_NAME: "policy_name",
};

export function Policy(name: string) {
  return function (target: any) {
    Reflect.defineMetadata(POLICY_META_KEYS.POLICY_NAME, name, target);
    rawPoliciesRegistry.push(target);
  };
}