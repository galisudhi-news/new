import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { PrismaService } from "../../prisma.service";
import { Actor, CurrentUser, JwtAuthGuard, RequirePermissions } from "../../common/auth.guard";
import { ROLE_PERMISSIONS, permissionsFor } from "../../common/rbac";

@Controller("users")
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() actor: Actor) {
    const user = await this.prisma.user.findUnique({
      where: { id: actor.id },
      select: { id: true, email: true, name: true, avatarUrl: true, status: true, roles: true }
    });
    const roles = user?.roles.map((role) => role.name) ?? actor.roles;
    return { ...user, roles, permissions: permissionsFor(roles) };
  }

  /** Role catalogue with the permission matrix, for the admin users screen. */
  @Get("roles")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  roles() {
    return Object.entries(ROLE_PERMISSIONS).map(([name, permissions]) => ({ name, permissions }));
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:approve")
  list() {
    return this.prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, email: true, name: true, status: true, createdAt: true, roles: true }
    });
  }
}
