import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ArticlesController } from "./articles.controller";
import { AdminArticlesController } from "./admin-articles.controller";
import { TaxonomyController } from "./taxonomy.controller";
import { ArticlesService } from "./articles.service";
import { ArticlesResolver } from "./articles.resolver";
import { PrismaService } from "../../prisma.service";

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET || "development-secret" })],
  controllers: [ArticlesController, AdminArticlesController, TaxonomyController],
  providers: [ArticlesService, ArticlesResolver, PrismaService],
  exports: [ArticlesService]
})
export class ArticlesModule {}
