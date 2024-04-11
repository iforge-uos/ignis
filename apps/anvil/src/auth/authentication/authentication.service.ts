import { UsersService } from "@/users/users.service";
import type { User } from "@ignis/types/users";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
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

    return {
      access_token,
      refresh_token,
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

  setAuthCookies(res: Response, access_token: string, refresh_token: string) {
    const accessTokenExpiresIn = new Date(Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1h"));
    const refreshTokenExpiresIn = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d"));

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
      expires: accessTokenExpiresIn,
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
      expires: refreshTokenExpiresIn,
    });
  }

  clearAuthCookies(res: Response) {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
      expires: new Date(0),
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict",
      expires: new Date(0),
    });
  }
}
