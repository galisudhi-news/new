import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { ArticlesService } from "./articles.service";

/**
 * Public taxonomy for the site navigation. Only categories and districts that
 * actually have published articles are returned, so the menu never links to an
 * empty page.
 */
@ApiTags("taxonomy")
@Controller()
export class TaxonomyController {
  constructor(private readonly service: ArticlesService) {}

  @Get("categories")
  categories() {
    return this.service.publicCategories();
  }

  @Get("districts")
  districts() {
    return this.service.publicDistricts();
  }
}
