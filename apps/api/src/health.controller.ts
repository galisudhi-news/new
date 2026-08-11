import { Controller, Get } from "@nestjs/common";

import { PrismaService } from "./prisma.service";

/** Classified reasons a database round trip can fail, for /health/db. */
function classify(error: unknown): { reason: string; hint: string } {
  const message = error instanceof Error ? error.message : String(error);

  if (/Environment variable not found: DATABASE_URL/i.test(message)) {
    return { reason: "DATABASE_URL_MISSING", hint: "Set DATABASE_URL in the deployment's environment variables and redeploy." };
  }
  if (/Query engine library|could not locate the Query Engine|binaryTargets/i.test(message)) {
    return { reason: "PRISMA_ENGINE_MISSING", hint: "The query engine for this platform is not in the bundle; check binaryTargets and includeFiles." };
  }
  if (/Authentication failed|password authentication/i.test(message)) {
    return { reason: "BAD_CREDENTIALS", hint: "The user or password in DATABASE_URL is wrong." };
  }
  if (/Can't reach database server|connection refused|ETIMEDOUT|ENOTFOUND/i.test(message)) {
    return { reason: "UNREACHABLE", hint: "Host unreachable — check the hostname, or the database may be waking from idle." };
  }
  if (/does not exist in the current database|relation .* does not exist|P2021/i.test(message)) {
    return { reason: "SCHEMA_MISSING", hint: "Tables are missing — run `prisma migrate deploy` against this database." };
  }
  return { reason: "UNKNOWN", hint: "See the deployment's runtime logs for the full error." };
}

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  health() {
    return { status: "ok", service: "news-api", timestamp: new Date().toISOString() };
  }

  /**
   * Database reachability probe. Deliberately reports only a classified reason,
   * never the connection string, credentials or a stack trace.
   */
  @Get("db")
  async database() {
    const configured = Boolean(process.env.DATABASE_URL);
    const pooled = /-pooler\./.test(process.env.DATABASE_URL || "");
    const startedAt = Date.now();

    try {
      const users = await this.prisma.user.count();
      const articles = await this.prisma.article.count();
      return {
        status: "ok",
        databaseUrlConfigured: configured,
        pooledConnection: pooled,
        users,
        articles,
        ms: Date.now() - startedAt
      };
    } catch (error) {
      const { reason, hint } = classify(error);
      return {
        status: "error",
        databaseUrlConfigured: configured,
        pooledConnection: pooled,
        reason,
        hint,
        ms: Date.now() - startedAt
      };
    }
  }
}
