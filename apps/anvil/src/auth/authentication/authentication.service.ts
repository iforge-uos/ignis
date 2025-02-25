import { UsersService } from "@/users/users.service";
import type { User } from "@ignis/types/users";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CookieOptions, Response } from "express";
import { JwtPayload } from "../interfaces/jwtpayload.interface";

const ms = require("ms");

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      uid: user.username,
      roles: user.roles.map((role) => role.id),
    };

    const jwtExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN;
    const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;

    const access_token = this.jwtService.sign(payload, {
      expiresIn: jwtExpiresIn,
    });
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiresIn,
    });
    // Couple the CSRF token to the auth token expiry (each ''session'')
    const csrf_token = this.jwtService.sign({}, { expiresIn: jwtExpiresIn });

    return {
      access_token,
      refresh_token,
      csrf_token,
      user,
    };
  }

  async validateRefreshToken(refreshToken: string): Promise<any> {
    try {
      return this.jwtService.verify(refreshToken);
    } catch (e) {
      throw new UnauthorizedException("Refresh token is invalid or has expired.");
    }
  }

  async validateAccessToken(accessToken: string, requiredRoles?: string[]): Promise<User> {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      if (requiredRoles && !user.roles.some((role) => requiredRoles?.includes(role.name))) {
        throw new UnauthorizedException("User does not have the required role");
      }

      return user;
    } catch (_error) {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  setAuthCookies(res: Response, access_token: string, refresh_token: string, csrf_token: string) {
    const accessTokenExpiresIn = new Date(Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1h"));
    const refreshTokenExpiresIn = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d"));
    const csrfTokenExpiresIn = new Date(Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1h") + ms("30s"));

    const baseCookieOptions: CookieOptions = {
      secure: true,
      path: "/",
      sameSite: "lax",
    };

    if (process.env.NODE_ENV === "production") {
      baseCookieOptions.domain = ".iforge.sheffield.ac.uk";
    }

    res.cookie("access_token", access_token, {
      ...baseCookieOptions,
      httpOnly: true,
      expires: accessTokenExpiresIn,
    });

    res.cookie("refresh_token", refresh_token, {
      ...baseCookieOptions,
      httpOnly: true,
      expires: refreshTokenExpiresIn,
    });

    res.cookie("csrf_token", csrf_token, {
      ...baseCookieOptions,
      httpOnly: false,
      expires: csrfTokenExpiresIn,
    });
  }

  clearAuthCookies(res: Response) {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
      expires: new Date(0),
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.domain = ".iforge.sheffield.ac.uk";
    }

    res.clearCookie("access_token", cookieOptions);

    res.clearCookie("refresh_token", cookieOptions);

    res.clearCookie("csrf_token", { ...cookieOptions, httpOnly: false });
  }

  getExpiryDate(token: string): Date {
    const payload = this.jwtService.verify(token);
    return new Date(payload.exp * 1000);
  }
}
