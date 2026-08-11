import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { Actor, CurrentUser, JwtAuthGuard } from "../../common/auth.guard";

class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateCredentials(dto.email, dto.password);
    return this.auth.login(user);
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() actor: Actor) {
    return this.auth.profile(actor.id);
  }
}
