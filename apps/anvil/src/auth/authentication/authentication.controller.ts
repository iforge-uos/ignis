import {User as GetUser} from "@/shared/decorators/user.decorator";
import {IntegrationsService} from "@/users/integrations/integrations.service";
import {UsersService} from "@/users/users.service";
import type {User} from "@ignis/types/users";
import {
    BadRequestException,
    ConflictException,
    Controller,
    Get,
    Logger,
    Post,
    Redirect,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {Throttle} from "@nestjs/throttler";
import {Request, Response} from "express";
import {AuthenticationService} from "./authentication.service";
import {BlacklistService} from "./blacklist/blacklist.service";

@Controller("authentication")
export class AuthenticationController {
    constructor(
        private readonly authService: AuthenticationService,
        private readonly integrationsService: IntegrationsService,
        private readonly blacklistService: BlacklistService,
        private readonly usersService: UsersService,
        private readonly logger: Logger,
    ) {
    }

    @UseGuards(AuthGuard("ldap"))
    @Post("ldap-login")
    async ldapLogin(@GetUser() user: User) {
        this.logger.log(`LDAP login for user with ID: ${user.id}`, AuthenticationController.name);
        return this.authService.login(user);
    }

    @Post("refresh")
    async refreshToken(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            this.logger.warn("Refresh token is missing", AuthenticationController.name);
            throw new BadRequestException("Refresh token is missing");
        }

        const isBlacklisted = await this.blacklistService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) {
            this.logger.warn("The refresh token is blacklisted", AuthenticationController.name);
            this.authService.clearAuthCookies(res);
            throw new UnauthorizedException("The refresh token is no longer valid");
        }

        const payload = await this.authService.validateRefreshToken(refreshToken);

        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            this.logger.warn("User not found", AuthenticationController.name);
            throw new UnauthorizedException("User not found");
        }

        const expiryDate = new Date();
        await this.blacklistService.addToBlacklist(refreshToken, expiryDate);

        const {access_token, refresh_token, csrf_token} = await this.authService.login(user);

        this.authService.setAuthCookies(res, access_token, refresh_token, csrf_token);

        this.logger.log("Tokens refreshed", AuthenticationController.name);
        return {message: "Tokens refreshed"};
    }

    @Throttle({default: {limit: 1, ttl: 1000}})
    @Post("logout")
    async logout(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        const refreshToken = req.cookies.refresh_token;

        if (!refreshToken) {
            this.logger.warn("Refresh token is missing", AuthenticationController.name);
            throw new BadRequestException("Refresh token is missing");
        }

        const expiryDate = new Date();
        try {
            await this.blacklistService.addToBlacklist(refreshToken, expiryDate);
            this.logger.log("Refresh token added to blacklist", AuthenticationController.name);
        } catch (error) {
            this.logger.error(
                "Error adding refresh token to blacklist",
                (error as Error).stack,
                AuthenticationController.name,
            );
            throw new ConflictException("Refresh token is invalid or expired");
        }

        this.authService.clearAuthCookies(res);

        this.logger.log("Successfully logged out", AuthenticationController.name);
        return {message: "Successfully logged out"};
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
    async googleLogin(@Req() req: Request) {
        this.logger.log("Google login initiated", AuthenticationController.name);
    }

    @UseGuards(AuthGuard("google"))
    @Get("google/callback")
    @Redirect()
    async googleRedirect(@Req() req: any, @Res({passthrough: true}) res: Response) {
        const {access_token, refresh_token, csrf_token} = await this.authService.login(req.user);

        this.authService.setAuthCookies(res, access_token, refresh_token, csrf_token);

        this.logger.log(`Google login successful for user with ID: ${req.user.id}`, AuthenticationController.name);
        return {url: `${process.env.FRONT_END_URL}/auth/login/complete`};
    }
}
