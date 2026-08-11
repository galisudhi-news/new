import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { ArticlesService } from "./articles.service";
import { CreateArticleDto, PublishDto, UpdateArticleDto, WorkflowNoteDto } from "./articles.dto";
import { Actor, CurrentUser, JwtAuthGuard, RequirePermissions } from "../../common/auth.guard";

@ApiTags("articles")
@Controller("articles")
export class ArticlesController {
  constructor(private readonly service: ArticlesService) {}

  // -------------------------------------------------------- public reading

  @Get()
  findAll(@Query("locale") locale = "en", @Query("limit") limit = "20") {
    return this.service.findAll(locale, Math.min(Number(limit) || 20, 100));
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string, @Query("locale") locale = "en") {
    return this.service.findBySlug(slug, locale);
  }

  // ------------------------------------------------------------- authoring

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:create")
  create(@Body() dto: CreateArticleDto, @CurrentUser() actor: Actor) {
    return this.service.create(dto, actor);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:edit")
  update(@Param("id") id: string, @Body() dto: UpdateArticleDto, @CurrentUser() actor: Actor) {
    return this.service.update(id, dto, actor);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:delete")
  remove(@Param("id") id: string, @CurrentUser() actor: Actor) {
    return this.service.remove(id, actor);
  }

  // -------------------------------------------------------------- workflow

  @Post(":id/submit")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:submit")
  submit(@Param("id") id: string, @Body() dto: WorkflowNoteDto, @CurrentUser() actor: Actor) {
    return this.service.transition(id, "SUBMIT", actor, { note: dto.note });
  }

  @Post(":id/approve")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:approve")
  approve(@Param("id") id: string, @Body() dto: WorkflowNoteDto, @CurrentUser() actor: Actor) {
    return this.service.transition(id, "APPROVE", actor, { note: dto.note });
  }

  @Post(":id/reject")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:review")
  reject(@Param("id") id: string, @Body() dto: WorkflowNoteDto, @CurrentUser() actor: Actor) {
    return this.service.transition(id, "REJECT", actor, { note: dto.note });
  }

  @Post(":id/request-changes")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:review")
  requestChanges(@Param("id") id: string, @Body() dto: WorkflowNoteDto, @CurrentUser() actor: Actor) {
    return this.service.transition(id, "REQUEST_CHANGES", actor, { note: dto.note });
  }

  @Post(":id/publish")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:publish")
  publish(@Param("id") id: string, @Body() dto: PublishDto, @CurrentUser() actor: Actor) {
    if (dto.scheduledAt) {
      return this.service.transition(id, "SCHEDULE", actor, { note: dto.note, scheduledAt: dto.scheduledAt });
    }
    return this.service.transition(id, "PUBLISH", actor, { note: dto.note });
  }

  @Post(":id/schedule")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:publish")
  schedule(@Param("id") id: string, @Body() dto: PublishDto, @CurrentUser() actor: Actor) {
    return this.service.transition(id, "SCHEDULE", actor, { note: dto.note, scheduledAt: dto.scheduledAt });
  }

  @Post(":id/archive")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions("articles:publish")
  archive(@Param("id") id: string, @Body() dto: WorkflowNoteDto, @CurrentUser() actor: Actor) {
    return this.service.transition(id, "ARCHIVE", actor, { note: dto.note });
  }
}
