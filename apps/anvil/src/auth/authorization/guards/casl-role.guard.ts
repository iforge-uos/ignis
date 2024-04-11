import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_ADMIN_KEY, IS_REP_KEY } from "../decorators/check-roles-decorator";

@Injectable()
export class CaslRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdmin = this.reflector.get<boolean>(IS_ADMIN_KEY, context.getHandler());
    const isRep = this.reflector.get<boolean>(IS_REP_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest<Request>();
    const { user } = request;

    if (isAdmin) {
      return user!.roles.some((role) => role.name === "Admin");
    }
    if (isRep) {
      return user!.roles.some((role) => role.name === "Rep");
    }

    return false;
  }
}
