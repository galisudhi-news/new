import { HealthController } from "./health.controller";
import type { PrismaService } from "./prisma.service";

const prismaStub = (overrides: Partial<Record<"user" | "article", { count: () => Promise<number> }>> = {}) =>
  ({
    user: overrides.user ?? { count: async () => 4 },
    article: overrides.article ?? { count: async () => 16 }
  }) as unknown as PrismaService;

describe("HealthController", () => {
  it("returns healthy status", () => {
    expect(new HealthController(prismaStub()).health().status).toBe("ok");
  });

  it("reports database counts when reachable", async () => {
    const result = await new HealthController(prismaStub()).database();
    expect(result.status).toBe("ok");
    expect(result.users).toBe(4);
    expect(result.articles).toBe(16);
  });

  it("classifies a missing DATABASE_URL without leaking the error", async () => {
    const failing = prismaStub({
      user: {
        count: async () => {
          throw new Error("Environment variable not found: DATABASE_URL.");
        }
      }
    });
    const result = await new HealthController(failing).database();
    expect(result.status).toBe("error");
    expect(result.reason).toBe("DATABASE_URL_MISSING");
  });
});
