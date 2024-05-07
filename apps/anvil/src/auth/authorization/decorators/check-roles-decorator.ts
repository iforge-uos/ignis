import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { CaslRoleGuard } from "../guards/casl-role.guard";

export const IS_ADMIN_KEY = "admin";
export const IS_REP_KEY = "rep";

export function IsAdmin(): MethodDecorator {
  return applyDecorators(SetMetadata(IS_ADMIN_KEY, true), UseGuards(CaslRoleGuard));
}

export function IsRep(): MethodDecorator {
  return applyDecorators(SetMetadata(IS_REP_KEY, true), UseGuards(CaslRoleGuard));
}
