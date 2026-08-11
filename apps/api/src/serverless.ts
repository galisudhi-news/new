/**
 * Serverless bootstrap for platforms that invoke a request handler instead of
 * running a long-lived process (Vercel, Lambda, Cloud Functions).
 *
 * `src/main.ts` remains the entrypoint for `npm start`, Docker and local dev.
 * Both share the same AppModule and middleware setup.
 */
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";

import { AppModule } from "./app.module";

type RequestHandler = (req: unknown, res: unknown) => void;

let cached: Promise<RequestHandler> | null = null;

async function bootstrap(): Promise<RequestHandler> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ["error", "warn"] });
  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  return app.getHttpAdapter().getInstance() as unknown as RequestHandler;
}

/** Returns the Express handler, bootstrapping Nest once per warm instance. */
export async function getHandler(): Promise<RequestHandler> {
  cached ??= bootstrap();
  return cached;
}

export default async function handler(req: unknown, res: unknown) {
  const express = await getHandler();
  return express(req, res);
}
