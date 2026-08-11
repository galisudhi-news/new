import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ArticleStatus } from "@prisma/client";

import { ArticlesService } from "./articles.service";
import { Actor, CurrentUser, JwtAuthGuard, RequirePermissions } from "../../common/auth.guard";
import { permissionsFor } from "../../common/rbac";

/**
 * Editorial desk read models. Everything here is scoped by role inside the
 * service: a reporter only ever sees their own articles.
 */
@ApiTags("admin")
@ApiBearerAuth()
@Controller("admin/articles")
@UseGuards(JwtAuthGuard)
export class AdminArticlesController {
  constructor(private readonly service: ArticlesService) {}

  @Get("counts")
  counts(@CurrentUser() actor: Actor) {
    return this.service.adminCounts(actor);
  }

  @Post("publish-due")
  @RequirePermissions("articles:publish")
  publishDue() {
    return this.service.publishDueScheduled();
  }

  @Get()
  list(
    @CurrentUser() actor: Actor,
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("mine") mine?: string,
    @Query("take") take?: string,
    @Query("skip") skip?: string
  ) {
    return this.service.adminList(actor, {
      status: this.parseStatus(status),
      search: search?.trim() || undefined,
      mine: mine === "true" || mine === "1",
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined
    });
  }

  @Get("me/permissions")
  permissions(@CurrentUser() actor: Actor) {
    return { id: actor.id, email: actor.email, roles: actor.roles, permissions: permissionsFor(actor.roles) };
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() actor: Actor) {
    return this.service.adminFindOne(id, actor);
  }

  @Get(":id/audit")
  audit(@Param("id") id: string) {
    return this.service.auditTrail(id);
  }

  private parseStatus(status?: string): ArticleStatus | undefined {
    if (!status || status === "ALL") return undefined;
    const upper = status.toUpperCase();
    return (Object.values(ArticleStatus) as string[]).includes(upper) ? (upper as ArticleStatus) : undefined;
  }
}
