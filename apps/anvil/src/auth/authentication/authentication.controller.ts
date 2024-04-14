import { User as GetUser } from "@/shared/decorators/user.decorator";
import { IntegrationsService } from "@/users/integrations/integrations.service";
import { UsersService } from "@/users/users.service";
import type { User } from "@ignis/types/users";
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { AuthenticationService } from "./authentication.service";
import { BlacklistService } from "./blacklist/blacklist.service";
import { CardinalityViolationError } from "edgedb";

@Controller("authentication")
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly integrationsService: IntegrationsService,
    private readonly blacklistService: BlacklistService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard("ldap"))
  @Post("ldap-login")
  async ldapLogin(@GetUser() user: User) {
    return this.authService.login(user);
  }

  @Post("refresh")
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new BadRequestException("Refresh token is missing");
    }

    // Check if the token is blacklisted
    const isBlacklisted = await this.blacklistService.isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      this.authService.clearAuthCookies(res);
      throw new UnauthorizedException("The refresh token is no longer valid");
    }

    const payload = await this.authService.validateRefreshToken(refreshToken);

    // Fetch the user based on the payload
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Add the token to the blacklist
    const expiryDate = new Date();
    await this.blacklistService.addToBlacklist(refreshToken, expiryDate);

    const { access_token, refresh_token } = await this.authService.login(user);

    this.authService.setAuthCookies(res, access_token, refresh_token);

    return { message: "Tokens refreshed" };
  }

  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Extract the refresh token from cookies instead of the request body
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new BadRequestException("Refresh token is missing");
    }

    // Add the token to the blacklist
    const expiryDate = new Date();
    try {
      await this.blacklistService.addToBlacklist(refreshToken, expiryDate);
    } catch (error) {
      throw new ConflictException({ message: `Refresh token is invalid or expired\nCaused by\n${error}` });
    }

    this.authService.clearAuthCookies(res);

    return { message: "Successfully logged out" };
  }

  // @UseGuards(AuthGuard("discord"))
  // @Get("discord-login")
  // async discordLogin(@Req() req: any) {
  //   // Check if user is authenticated with another method like LDAP before linking
  //   if (!req.isAuthenticated()) {
  //     throw new UnauthorizedException(
  //       "User is not authenticated with primary method",
  //     );
  //   }
  //   // Link Discord account to authenticated user
  //   await this.integrationsService.linkDiscordAccount(req.user.id, req.user);
  //   return req.user;
  // }
  //
  // @UseGuards(AuthGuard("discord"))
  // @Get("discord/callback")
  // async discordRedirect(@Req() req: any) {
  //   const tokens = await this.authService.login(req.user);
  //   return {
  //     ...tokens,
  //     user: req.user,
  //   };
  // }

  @UseGuards(AuthGuard("google"))
  @Get("login")
  async googleLogin(@Req() req: Request) {}

  @UseGuards(AuthGuard("google"))
  @Get("google/callback")
  @Redirect()
  async googleRedirect(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.login(req.user);

    this.authService.setAuthCookies(res, access_token, refresh_token);

    return { url: `${process.env.FRONT_END_URL}/auth/login/complete` };
  }
}
