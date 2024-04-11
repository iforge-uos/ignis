import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {ExtractJwt, JwtFromRequestFunction, Strategy} from "passport-jwt";
import { JwtPayload } from "../../interfaces/jwtpayload.interface";
import { UsersService } from "@/users/users.service";
import type { User } from "@ignis/types/users";
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

const cookieExtractor: JwtFromRequestFunction = (request: Request): string | null => {
  let token = null;
  if (request && request.cookies) {
    token = request.cookies['access_token'];
  }
  return token;
};
