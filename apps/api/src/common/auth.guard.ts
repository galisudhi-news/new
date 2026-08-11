import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import { hasPermission, permissionsFor, type Permission } from "./rbac";

export type ActorPayload = {
  sub: string;
  email: string;
  roles: string[];
};

export type Actor = ActorPayload & {
  id: string;
  permissions: Permission[];
};

export const PERMISSIONS_KEY = "required_permissions";

/** Requires the caller to hold every listed permission. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

type RequestWithActor = Request & { actor?: Actor };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithActor>();
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) throw new UnauthorizedException("Missing bearer token");

    let payload: ActorPayload;
    try {
      payload = this.jwt.verify<ActorPayload>(token);
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const roles = payload.roles || [];
    request.actor = {
      ...payload,
      id: payload.sub,
      roles,
      permissions: permissionsFor(roles)
    };

    const required =
      this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass()
      ]) || [];

    const missing = required.filter((permission) => !hasPermission(roles, permission));
    if (missing.length) {
      throw new ForbiddenException(`Missing permission(s): ${missing.join(", ")}`);
    }

    return true;
  }
}

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): Actor => {
  const request = context.switchToHttp().getRequest<RequestWithActor>();
  if (!request.actor) throw new UnauthorizedException("Not authenticated");
  return request.actor;
});
