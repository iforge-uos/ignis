import {IdempotencyCache} from "@/shared/decorators/idempotency.decorator";
import {User as GetUser} from "@/shared/decorators/user.decorator";
import {IdempotencyCacheInterceptor} from "@/shared/interceptors/idempotency-cache.interceptor";
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
    Query,
    Redirect,
    Req,
    Res,
    UnauthorizedException,
    UseGuards, UseInterceptors,
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

        try {
            const {access_token, refresh_token, csrf_token} = await this.refreshTokens(refreshToken, undefined);
            this.authService.setAuthCookies(res, access_token, refresh_token, csrf_token);
            this.logger.log("Tokens refreshed", AuthenticationController.name);
            return {message: "Tokens refreshed"};
        } catch (error) {
            this.logger.warn("Refresh token failed, clearing cookies", AuthenticationController.name);
            // Clear all authentication cookies
            //this.authService.clearAuthCookies(res);
            // Re-throw the error to be handled by the frontend
            throw error;
        }
    }

    @UseInterceptors(IdempotencyCacheInterceptor)
    @IdempotencyCache(60)
    @Throttle({default: {limit: 1, ttl: 1000}})
    @Post("logout")
    async logout(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        const refreshToken = req.cookies.refresh_token;

        if (!refreshToken) {
            this.logger.warn("Refresh token is missing", AuthenticationController.name);
            throw new BadRequestException("Refresh token is missing");
        }

        const expiryDate = this.authService.getExpiryDate(refreshToken);

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

    @Get("validate-access")
    async validateToken(@Req() req: Request, @Res({passthrough: true}) res: Response, @Query("role") requiredRole?: string) {
        this.logger.log(`Validating access token${requiredRole ? ` for role: ${requiredRole}` : ''}`, AuthenticationController.name);
        const accessToken = req.cookies.access_token;
        const refreshToken = req.cookies.refresh_token;

        if (!accessToken && !refreshToken) {
            throw new UnauthorizedException("Both access token and refresh token are missing");
        }

        try {
            if (accessToken) {
                await this.authService.validateAccessToken(accessToken, requiredRole);
                return {status: "ok", message: "Access token and role is valid"};
            }
        } catch (error) {
            if (!refreshToken) {
                throw new UnauthorizedException("Access token is invalid and refresh token is missing");
            }
            // If access token is invalid and refresh token exists, proceed to refresh
        }

        const {access_token, refresh_token, csrf_token} = await this.refreshTokens(refreshToken, requiredRole);

        this.authService.setAuthCookies(res, access_token, refresh_token, csrf_token);

        return {status: "ok", message: "Tokens refreshed and validated"};
    }

    private async refreshTokens(refreshToken: string, requiredRole?: string) {
        const isBlacklisted = await this.blacklistService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) {
            this.logger.warn("The refresh token is blacklisted", AuthenticationController.name);
            throw new UnauthorizedException("The refresh token is no longer valid");
        }

        const payload = await this.authService.validateRefreshToken(refreshToken);

        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            this.logger.warn("User not found", AuthenticationController.name);
            throw new UnauthorizedException("User not found");
        }

        // Check the role if required
        if (requiredRole && !user.roles.some(role => role.name === requiredRole)) {
            this.logger.warn(`User does not have the required role: ${requiredRole}`, AuthenticationController.name);
            throw new UnauthorizedException("User does not have the required role");
        }

        const expiryDate = this.authService.getExpiryDate(refreshToken);

        await this.blacklistService.addToBlacklist(refreshToken, expiryDate);

        return await this.authService.login(user);
    }

}
