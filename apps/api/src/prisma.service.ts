import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      // A cold or unreachable database must not take the whole process down:
      // on serverless that turns every route, including /api/health, into an
      // opaque FUNCTION_INVOCATION_FAILED. Prisma reconnects lazily on the
      // first query, so failures surface per-request with a real message.
      this.logger.error(
        `Initial database connection failed, continuing with lazy connect: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
