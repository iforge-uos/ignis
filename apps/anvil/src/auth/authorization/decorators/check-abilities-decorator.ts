import { auth } from "@dbschema/interfaces";
import { SetMetadata } from "@nestjs/common";

export const ACTIONS_KEY = "actions";
export const SUBJECT_KEY = "subject";

export const CheckAbilities = (actions: auth.PermissionAction[], subject: auth.PermissionSubject = "ALL") => {
  return (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => {
    SetMetadata(ACTIONS_KEY, actions)(target, key, descriptor);
    SetMetadata(SUBJECT_KEY, subject)(target, key, descriptor);
  };
};
