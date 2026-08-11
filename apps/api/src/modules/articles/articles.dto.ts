import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested
} from "class-validator";

export const ARTICLE_STATUSES = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED"
] as const;

export type ArticleStatusLiteral = (typeof ARTICLE_STATUSES)[number];

export class ArticleTranslationDto {
  @IsString() @MinLength(3) title!: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsString() @MinLength(10) body!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsString() ogTitle?: string;
  @IsOptional() @IsString() ogDescription?: string;
}

export class PartialArticleTranslationDto {
  @IsOptional() @IsString() @MinLength(3) title?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() @MinLength(10) body?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsString() ogTitle?: string;
  @IsOptional() @IsString() ogDescription?: string;
}

export class SeoDto {
  @IsOptional() @IsString() canonicalUrl?: string;
  @IsOptional() @IsString() ogImage?: string;
}

export class CreateArticleDto {
  @IsString() @MinLength(3) slug!: string;
  @IsString() @MinLength(2) categorySlug!: string;
  @IsString() @MinLength(2) categoryName!: string;
  @IsOptional() @IsString() districtSlug?: string;
  @IsOptional() @IsString() featuredImage?: string;
  @IsOptional() @IsBoolean() isBreaking?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsIn(ARTICLE_STATUSES) status?: ArticleStatusLiteral;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @ValidateNested() @Type(() => SeoDto) seo?: SeoDto;
  @ValidateNested() @Type(() => ArticleTranslationDto) en!: ArticleTranslationDto;
  @ValidateNested() @Type(() => ArticleTranslationDto) kn!: ArticleTranslationDto;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() @MinLength(3) slug?: string;
  @IsOptional() @IsString() @MinLength(2) categorySlug?: string;
  @IsOptional() @IsString() @MinLength(2) categoryName?: string;
  @IsOptional() @IsString() districtSlug?: string;
  @IsOptional() @IsString() featuredImage?: string;
  @IsOptional() @IsBoolean() isBreaking?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @ValidateNested() @Type(() => SeoDto) seo?: SeoDto;
  @IsOptional() @ValidateNested() @Type(() => PartialArticleTranslationDto) en?: PartialArticleTranslationDto;
  @IsOptional() @ValidateNested() @Type(() => PartialArticleTranslationDto) kn?: PartialArticleTranslationDto;
}

export class WorkflowNoteDto {
  @IsOptional() @IsString() note?: string;
}

export class PublishDto {
  @IsOptional() @IsString() note?: string;
  /** When present the article is SCHEDULED for this instant instead of published now. */
  @IsOptional() @IsDateString() scheduledAt?: string;
}
