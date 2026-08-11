import { Args, Query, Resolver } from "@nestjs/graphql";
import { ArticlesService } from "./articles.service";

@Resolver()
export class ArticlesResolver {
  constructor(private readonly service: ArticlesService) {}

  @Query(() => String)
  async articleFeed(@Args("locale", { defaultValue: "en" }) locale: string) {
    const data = await this.service.findAll(locale, 20);
    return JSON.stringify(data);
  }
}
