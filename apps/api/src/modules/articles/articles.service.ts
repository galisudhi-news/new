import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ArticleStatus, Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma.service";
import type { Actor } from "../../common/auth.guard";
import { canManageOthersArticles, hasPermission, type Permission } from "../../common/rbac";
import {
  AUTHOR_EDITABLE,
  TRANSITIONS,
  createPermissionFor,
  editPermissionFor,
  type WorkflowAction
} from "./article-workflow";
import type { CreateArticleDto, UpdateArticleDto, PartialArticleTranslationDto } from "./articles.dto";

const ADMIN_INCLUDE = {
  category: true,
  district: true,
  author: { select: { id: true, name: true, email: true } },
  reporter: { select: { id: true, name: true, email: true } },
  submittedBy: { select: { id: true, name: true, email: true } },
  reviewedBy: { select: { id: true, name: true, email: true } },
  publishedBy: { select: { id: true, name: true, email: true } },
  tags: true,
  seo: true,
  translations: true
} satisfies Prisma.ArticleInclude;

const PUBLIC_LIST_INCLUDE = {
  category: true,
  author: { select: { id: true, name: true } },
  district: true
} satisfies Prisma.ArticleInclude;

@Injectable()
export class ArticlesService {
  /** Throttles the opportunistic "publish anything whose schedule elapsed" sweep. */
  private lastScheduleSweep = 0;

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------- public

  async findAll(locale: string, limit: number) {
    const languageId = this.normalizeLocale(locale);
    await this.publishDueScheduled({ throttle: true });

    return this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        translations: { some: { languageId } }
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        ...PUBLIC_LIST_INCLUDE,
        translations: { where: { languageId }, take: 1 }
      }
    });
  }

  async findBySlug(slug: string, locale = "en") {
    const languageId = this.normalizeLocale(locale);
    await this.publishDueScheduled({ throttle: true });

    const article = await this.prisma.article.findFirst({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [{ slug }, { translations: { some: { slug } } }],
        translations: { some: { languageId } }
      },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        tags: true,
        gallery: true,
        district: true,
        seo: true,
        translations: true
      }
    });
    if (!article) throw new NotFoundException("Article not found");

    // Keep the requested language first so clients can read translations[0],
    // while still exposing the counterpart for the language switcher.
    const translations = [...article.translations].sort((a, b) =>
      a.languageId === languageId ? -1 : b.languageId === languageId ? 1 : 0
    );
    return { ...article, translations };
  }

  /**
   * Flips SCHEDULED articles whose time has come to PUBLISHED. Called on public
   * reads (throttled to once a minute) and exposed as an admin endpoint so a
   * cron job can drive it explicitly.
   */
  async publishDueScheduled({ throttle = false }: { throttle?: boolean } = {}) {
    const now = Date.now();
    if (throttle && now - this.lastScheduleSweep < 60_000) return { published: 0 };
    this.lastScheduleSweep = now;

    const due = await this.prisma.article.findMany({
      where: { status: ArticleStatus.SCHEDULED, scheduledAt: { lte: new Date(now) } },
      select: { id: true, scheduledAt: true }
    });
    if (!due.length) return { published: 0 };

    await this.prisma.$transaction([
      ...due.map((article) =>
        this.prisma.article.update({
          where: { id: article.id },
          data: { status: ArticleStatus.PUBLISHED, publishedAt: article.scheduledAt ?? new Date() }
        })
      ),
      this.prisma.auditLog.createMany({
        data: due.map((article) => ({
          action: "PUBLISHED",
          entity: "Article",
          entityId: article.id,
          articleId: article.id,
          oldStatus: ArticleStatus.SCHEDULED,
          newStatus: ArticleStatus.PUBLISHED,
          note: "Auto-published on schedule"
        }))
      })
    ]);

    return { published: due.length };
  }

  // ----------------------------------------------------------------- admin

  async adminList(
    actor: Actor,
    options: { status?: ArticleStatus; search?: string; mine?: boolean; take?: number; skip?: number } = {}
  ) {
    const where: Prisma.ArticleWhereInput = {};
    if (options.status) where.status = options.status;
    if (options.mine || !canManageOthersArticles(actor.roles)) {
      where.OR = [{ authorId: actor.id }, { reporterId: actor.id }];
    }
    if (options.search) {
      where.AND = [
        {
          OR: [
            { slug: { contains: options.search, mode: "insensitive" } },
            { translations: { some: { title: { contains: options.search, mode: "insensitive" } } } }
          ]
        }
      ];
    }

    const take = Math.min(options.take ?? 50, 100);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        take,
        skip: options.skip ?? 0,
        orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
        include: ADMIN_INCLUDE
      }),
      this.prisma.article.count({ where })
    ]);

    return { items, total, take, skip: options.skip ?? 0 };
  }

  async adminCounts(actor: Actor) {
    const scope: Prisma.ArticleWhereInput = canManageOthersArticles(actor.roles)
      ? {}
      : { OR: [{ authorId: actor.id }, { reporterId: actor.id }] };

    const grouped = await this.prisma.article.groupBy({
      by: ["status"],
      where: scope,
      _count: { _all: true }
    });

    const counts: Record<string, number> = {
      DRAFT: 0,
      REVIEW: 0,
      APPROVED: 0,
      SCHEDULED: 0,
      PUBLISHED: 0,
      REJECTED: 0,
      ARCHIVED: 0,
      ALL: 0
    };
    for (const row of grouped) {
      counts[row.status] = row._count._all;
      counts.ALL += row._count._all;
    }
    return counts;
  }

  async adminFindOne(id: string, actor: Actor) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        ...ADMIN_INCLUDE,
        gallery: true,
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 25,
          include: { actor: { select: { id: true, name: true, email: true } } }
        }
      }
    });
    if (!article) throw new NotFoundException("Article not found");
    this.assertOwnership(article, actor);
    return article;
  }

  // -------------------------------------------------------------- mutations

  async create(dto: CreateArticleDto, actor: Actor) {
    const requested = (dto.status as ArticleStatus | undefined) ?? ArticleStatus.DRAFT;
    this.assertPermission(actor, createPermissionFor(requested));

    const slug = await this.uniqueArticleSlug(this.slugify(dto.slug));
    const category = await this.upsertCategory(dto.categorySlug, dto.categoryName);
    const district = await this.findDistrict(dto.districtSlug);
    await this.ensureLanguages();

    const now = new Date();
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    if (requested === ArticleStatus.SCHEDULED && !scheduledAt) {
      throw new BadRequestException("scheduledAt is required to schedule an article");
    }

    const article = await this.prisma.article.create({
      data: {
        slug,
        categoryId: category.id,
        districtId: district?.id,
        authorId: actor.id,
        reporterId: actor.id,
        featuredImage: dto.featuredImage || undefined,
        isBreaking: dto.isBreaking || false,
        isFeatured: dto.isFeatured || false,
        status: requested,
        scheduledAt: scheduledAt ?? undefined,
        submittedAt: requested === ArticleStatus.REVIEW ? now : undefined,
        submittedById: requested === ArticleStatus.REVIEW ? actor.id : undefined,
        publishedAt: requested === ArticleStatus.PUBLISHED ? now : undefined,
        publishedById: requested === ArticleStatus.PUBLISHED ? actor.id : undefined,
        tags: dto.tags?.length ? { connectOrCreate: dto.tags.map((tag) => this.tagConnect(tag)) } : undefined,
        seo: dto.seo ? { create: { canonicalUrl: dto.seo.canonicalUrl, ogImage: dto.seo.ogImage } } : undefined,
        translations: {
          create: [
            this.translationCreate("en", dto.en, slug),
            this.translationCreate("kn", dto.kn, `${slug}-kn`)
          ]
        }
      },
      include: ADMIN_INCLUDE
    });

    await this.log({
      articleId: article.id,
      actorId: actor.id,
      action: "CREATED",
      newStatus: article.status
    });
    if (requested === ArticleStatus.REVIEW) {
      await this.log({
        articleId: article.id,
        actorId: actor.id,
        action: "SUBMITTED_FOR_REVIEW",
        oldStatus: ArticleStatus.DRAFT,
        newStatus: ArticleStatus.REVIEW
      });
    }

    return article;
  }

  async update(id: string, dto: UpdateArticleDto, actor: Actor) {
    const existing = await this.prisma.article.findUnique({
      where: { id },
      include: { translations: true }
    });
    if (!existing) throw new NotFoundException("Article not found");

    this.assertOwnership(existing, actor);
    this.assertPermission(actor, editPermissionFor(existing.status));
    if (!canManageOthersArticles(actor.roles) && !AUTHOR_EDITABLE.includes(existing.status)) {
      throw new ForbiddenException(`You can only edit your own ${AUTHOR_EDITABLE.join(" / ")} articles`);
    }

    const data: Prisma.ArticleUpdateInput = {};
    if (dto.slug && this.slugify(dto.slug) !== existing.slug) {
      data.slug = await this.uniqueArticleSlug(this.slugify(dto.slug), id);
    }
    if (dto.categorySlug) {
      const category = await this.upsertCategory(dto.categorySlug, dto.categoryName || dto.categorySlug);
      data.category = { connect: { id: category.id } };
    }
    if (dto.districtSlug !== undefined) {
      const district = await this.findDistrict(dto.districtSlug);
      data.district = district ? { connect: { id: district.id } } : { disconnect: true };
    }
    if (dto.featuredImage !== undefined) data.featuredImage = dto.featuredImage || null;
    if (dto.isBreaking !== undefined) data.isBreaking = dto.isBreaking;
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.scheduledAt !== undefined) data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    if (dto.tags) {
      data.tags = { set: [], connectOrCreate: dto.tags.map((tag) => this.tagConnect(tag)) };
    }
    if (dto.seo) {
      data.seo = {
        upsert: {
          create: { canonicalUrl: dto.seo.canonicalUrl, ogImage: dto.seo.ogImage },
          update: { canonicalUrl: dto.seo.canonicalUrl, ogImage: dto.seo.ogImage }
        }
      };
    }

    await this.ensureLanguages();
    const article = await this.prisma.article.update({
      where: { id },
      data,
      include: ADMIN_INCLUDE
    });

    for (const languageId of ["en", "kn"] as const) {
      const translation = dto[languageId];
      if (translation) await this.upsertTranslation(id, languageId, translation, article.slug);
    }

    await this.log({
      articleId: id,
      actorId: actor.id,
      action: "UPDATED",
      oldStatus: existing.status,
      newStatus: existing.status
    });

    return this.prisma.article.findUniqueOrThrow({ where: { id }, include: ADMIN_INCLUDE });
  }

  /** The single door every status change goes through. */
  async transition(
    id: string,
    action: WorkflowAction,
    actor: Actor,
    options: { note?: string; scheduledAt?: string } = {}
  ) {
    const rule = TRANSITIONS[action];
    const existing = await this.prisma.article.findUnique({
      where: { id },
      include: { translations: true }
    });
    if (!existing) throw new NotFoundException("Article not found");

    this.assertPermission(actor, rule.permission);
    // Submitting is the one action an author performs on their own article;
    // every other transition is a newsroom action on someone else's work.
    if (action === "SUBMIT") this.assertOwnership(existing, actor);

    if (!rule.from.includes(existing.status)) {
      throw new BadRequestException(
        `Cannot ${action.toLowerCase().replace("_", " ")} an article in status ${existing.status} (expected ${rule.from.join(" or ")})`
      );
    }

    if (action === "SUBMIT") this.assertSubmittable(existing);

    const now = new Date();
    const data: Prisma.ArticleUpdateInput = { status: rule.to, reviewNote: options.note ?? null };

    if (action === "SUBMIT") {
      data.submittedAt = now;
      data.submittedBy = { connect: { id: actor.id } };
    }
    if (action === "APPROVE" || action === "REJECT" || action === "REQUEST_CHANGES") {
      data.reviewedAt = now;
      data.reviewedBy = { connect: { id: actor.id } };
    }
    if (action === "PUBLISH") {
      data.publishedAt = existing.publishedAt ?? now;
      data.publishedBy = { connect: { id: actor.id } };
      data.scheduledAt = null;
    }
    if (action === "SCHEDULE") {
      if (!options.scheduledAt) throw new BadRequestException("scheduledAt is required to schedule an article");
      const scheduledAt = new Date(options.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) throw new BadRequestException("scheduledAt is not a valid date");
      data.scheduledAt = scheduledAt;
    }

    const article = await this.prisma.article.update({ where: { id }, data, include: ADMIN_INCLUDE });

    await this.log({
      articleId: id,
      actorId: actor.id,
      action: rule.auditAction,
      oldStatus: existing.status,
      newStatus: rule.to,
      note: options.note
    });

    return article;
  }

  async remove(id: string, actor: Actor) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Article not found");
    this.assertPermission(actor, "articles:delete");

    await this.log({
      articleId: null,
      actorId: actor.id,
      action: "DELETED",
      entityId: id,
      oldStatus: existing.status,
      note: existing.slug
    });
    await this.prisma.article.delete({ where: { id } });
    return { id, deleted: true };
  }

  async auditTrail(articleId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity: "Article", entityId: articleId },
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { id: true, name: true, email: true } } }
    });
  }

  // ---------------------------------------------------------------- helpers

  private assertPermission(actor: Actor, permission: Permission) {
    if (!hasPermission(actor.roles, permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }

  private assertOwnership(article: { authorId: string; reporterId: string | null }, actor: Actor) {
    if (canManageOthersArticles(actor.roles)) return;
    if (article.authorId === actor.id || article.reporterId === actor.id) return;
    throw new ForbiddenException("You can only work on your own articles");
  }

  private assertSubmittable(article: { translations: { languageId: string; title: string; body: string }[] }) {
    for (const languageId of ["en", "kn"]) {
      const translation = article.translations.find((item) => item.languageId === languageId);
      if (!translation?.title?.trim() || !translation?.body?.trim()) {
        throw new BadRequestException(`The ${languageId.toUpperCase()} title and body are required before review`);
      }
    }
  }

  private async log(entry: {
    articleId: string | null;
    actorId?: string;
    action: string;
    entityId?: string;
    oldStatus?: ArticleStatus;
    newStatus?: ArticleStatus;
    note?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        entity: "Article",
        entityId: entry.entityId ?? entry.articleId ?? undefined,
        articleId: entry.articleId ?? undefined,
        actorId: entry.actorId,
        action: entry.action,
        oldStatus: entry.oldStatus,
        newStatus: entry.newStatus,
        note: entry.note
      }
    });
  }

  private async upsertCategory(slug: string, name: string) {
    const categorySlug = this.slugify(slug);
    return this.prisma.category.upsert({
      where: { slug: categorySlug },
      update: { name },
      create: { slug: categorySlug, name }
    });
  }

  private async findDistrict(slug?: string) {
    if (!slug) return null;
    return this.prisma.district.findUnique({ where: { slug: this.slugify(slug) } });
  }

  private async ensureLanguages() {
    await this.prisma.language.upsert({ where: { code: "en" }, update: {}, create: { code: "en", name: "English" } });
    await this.prisma.language.upsert({ where: { code: "kn" }, update: {}, create: { code: "kn", name: "Kannada" } });
  }

  private tagConnect(tag: string) {
    const slug = this.slugify(tag);
    return { where: { slug }, create: { slug, name: tag.trim() } };
  }

  private async upsertTranslation(
    articleId: string,
    languageId: "en" | "kn",
    input: PartialArticleTranslationDto,
    articleSlug: string
  ) {
    const fallbackSlug = languageId === "en" ? articleSlug : `${articleSlug}-kn`;
    const slug = input.slug ? await this.uniqueTranslationSlug(this.slugify(input.slug), articleId) : undefined;

    return this.prisma.articleTranslation.upsert({
      where: { articleId_languageId: { articleId, languageId } },
      update: {
        title: input.title,
        subtitle: input.subtitle,
        body: input.body,
        slug,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        ogTitle: input.ogTitle,
        ogDescription: input.ogDescription
      },
      create: {
        articleId,
        languageId,
        title: input.title || "",
        subtitle: input.subtitle,
        body: input.body || "",
        slug: slug ?? fallbackSlug,
        seoTitle: input.seoTitle || input.title,
        seoDescription: input.seoDescription || input.subtitle,
        ogTitle: input.ogTitle || input.seoTitle || input.title,
        ogDescription: input.ogDescription || input.seoDescription || input.subtitle
      }
    });
  }

  private async uniqueArticleSlug(slug: string, ignoreId?: string) {
    let candidate = slug || `article-${Date.now()}`;
    let suffix = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const clash = await this.prisma.article.findUnique({ where: { slug: candidate } });
      if (!clash || clash.id === ignoreId) return candidate;
      candidate = `${slug}-${suffix++}`;
    }
  }

  private async uniqueTranslationSlug(slug: string, articleId: string) {
    let candidate = slug;
    let suffix = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const clash = await this.prisma.articleTranslation.findFirst({ where: { slug: candidate } });
      if (!clash || clash.articleId === articleId) return candidate;
      candidate = `${slug}-${suffix++}`;
    }
  }

  private normalizeLocale(locale: string) {
    return locale === "kn" ? "kn" : "en";
  }

  private translationCreate(
    languageId: "en" | "kn",
    input: {
      title: string;
      subtitle?: string;
      body: string;
      slug?: string;
      seoTitle?: string;
      seoDescription?: string;
      ogTitle?: string;
      ogDescription?: string;
    },
    fallbackSlug: string
  ) {
    return {
      languageId,
      slug: input.slug ? this.slugify(input.slug) : fallbackSlug,
      title: input.title,
      subtitle: input.subtitle || undefined,
      body: input.body,
      seoTitle: input.seoTitle || input.title,
      seoDescription: input.seoDescription || input.subtitle,
      ogTitle: input.ogTitle || input.seoTitle || input.title,
      ogDescription: input.ogDescription || input.seoDescription || input.subtitle
    };
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  }
}
