import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma.service";
import { createHash } from "crypto";
import { permissionsFor } from "../../common/rbac";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { roles: true } });
    if (!user || user.passwordHash !== this.hash(password)) throw new UnauthorizedException("Invalid credentials");
    if (user.status !== "ACTIVE") throw new UnauthorizedException("Account is not active");
    return user;
  }

  login(user: { id: string; email: string; name?: string; roles?: { name: string }[] }) {
    const roles = user.roles?.map((role) => role.name) || [];
    return {
      accessToken: this.jwt.sign({ sub: user.id, email: user.email, roles }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        permissions: permissionsFor(roles)
      }
    };
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true }
    });
    if (!user) throw new UnauthorizedException("Account no longer exists");
    const roles = user.roles.map((role) => role.name);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roles,
      permissions: permissionsFor(roles)
    };
  }

  private hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
}
