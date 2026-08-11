import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";

import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";

import { ArticlesModule } from "./modules/articles/articles.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";

/** Vercel/Lambda: read-only filesystem, no long-lived process. */
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Serverless filesystems are read-only, so writing src/schema.gql at
      // bootstrap crashes the function. Generate the schema in memory there
      // and keep emitting the file for local development.
      autoSchemaFile: IS_SERVERLESS ? true : join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      introspection: true,
      playground: !IS_SERVERLESS && process.env.NODE_ENV !== "production",
    }),

    ArticlesModule,
    AuthModule,
    UsersModule,
  ],

  controllers: [HealthController],

  providers: [PrismaService],
})
export class AppModule {}