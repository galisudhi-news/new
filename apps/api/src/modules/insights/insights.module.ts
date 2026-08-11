import { Controller, Get, Module } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { InsightsService } from "./insights.service";

@ApiTags("insights")
@Controller("insights")
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  /** Weather + market strip for the public navigation. Cached upstream. */
  @Get()
  all() {
    return this.service.getAll();
  }

  @Get("weather")
  weather() {
    return this.service.getWeather();
  }

  @Get("markets")
  markets() {
    return this.service.getMarkets();
  }
}

@Module({
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService]
})
export class InsightsModule {}
