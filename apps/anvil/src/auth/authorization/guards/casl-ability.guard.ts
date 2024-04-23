import { auth } from "@dbschema/interfaces";
import { CanActivate, ExecutionContext, HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ACTIONS_KEY, SUBJECT_KEY } from "../decorators/check-abilities-decorator";
import { AuthorizationService } from "../services/authorization.service";

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredActions = this.reflector.get<auth.PermissionAction[]>(ACTIONS_KEY, context.getHandler()) || [];
    const subject = this.reflector.get<auth.PermissionSubject>(SUBJECT_KEY, context.getHandler()) || "ALL";

    const request = context.switchToHttp().getRequest<Request>();
    const { user } = request;

    if (!user) {
      return false; // If there's no user attached, deny access
    }
    // If the route is for the user's own id, allow access
    if (subject === "SELF" && request.path.includes(user.id)) {
      return true;
    }

    const ability = await this.authorizationService.defineAbilitiesFor(user);
    return requiredActions.every((action) => ability.can(action, subject === "SELF" ? "USER" : subject));
  }
}
