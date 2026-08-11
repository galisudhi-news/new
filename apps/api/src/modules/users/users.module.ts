import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "../../prisma.service";
import { UsersController } from "./users.controller";

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET || "development-secret" })],
  controllers: [UsersController],
  providers: [PrismaService]
})
export class UsersModule {}
