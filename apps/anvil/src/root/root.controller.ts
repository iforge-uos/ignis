import { IsAdmin, IsRep } from "@/auth/authorization/decorators/check-roles-decorator";
import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import { EdgeDBService } from "@/edgedb/edgedb.service";
import { GoogleService } from "@/google/google.service";
import { User as GetUser } from "@/shared/decorators/user.decorator";
import { SignInService } from "@/sign-in/sign-in.service";
import type { User } from "@ignis/types/users";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { CreateAgreementDto, UpdateAgreementDto } from "./dto/agreement.dto";
import { CreateSignInReasonCategoryDto } from "./dto/reason.dto";
import { RootService } from "./root.service";

@Controller()
export class RootController {
  constructor(
    private readonly signInService: SignInService,
    private readonly dbService: EdgeDBService,
    private readonly rootService: RootService,
    private readonly googleService: GoogleService,
  ) {}

  @Get("status")
  async getStatus() {
    return await this.rootService.getStatus();
  }

  @Get("sign-in-reasons-last-update")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async optionsSignInReasons(@Res() resp: Response) {
    const last_modified = await this.signInService.getSignInReasonsLastUpdate();
    resp.setHeader("Last-Modified", last_modified.toUTCString());
    return resp.send();
  }

  @Get("sign-in-reasons")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async getSignInReasons() {
    return await this.signInService.getSignInReasons();
  }

  @Post("sign-in-reasons")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async addSignInReason(@Body() reason: CreateSignInReasonCategoryDto) {
    return await this.signInService.addSignInReason(reason);
  }

  @Delete("sign-in-reasons/:id")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async deleteSignInReason(@Param("id") id: string) {
    return await this.signInService.deleteSignInReason(id);
  }

  @Get("agreements")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async getAgreements() {
    return this.rootService.getAgreements();
  }

  @Post("agreements")
  @IsAdmin()
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async createAgreement(@Body() body: CreateAgreementDto) {
    return await this.rootService.createAgreement(body.reason_ids, body.content);
  }

  @Get("agreements/:agreement_id")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async getAgreement(@Param("agreement_id") reason_id: string) {
    return await this.rootService.getAgreement(reason_id);
  }

  @Post("agreements/:agreement_id")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async signAgreement(@Param("agreement_id") agreement_id: string, @GetUser() user: User) {
    return await this.rootService.signAgreement(agreement_id, user);
  }

  @Patch("agreements/:agreement_id")
  @IsAdmin()
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async updateAgreement(@Param("agreement_id") agreement_id: string, @Body() body: UpdateAgreementDto) {
    return await this.rootService.updateAgreement(agreement_id, body.reason_ids, body.content);
  }

  @Get("teams")
  @IsRep()
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async getTeams() {
    return await this.rootService.getTeams();
  }

  @Get("autocomplete")
  // @UseGuards(AuthGuard('jwt'), CaslAbilityGuard)
  // @IsAdmin()
  async getAutocomplete(@Query("email") email: string) {
    return await this.googleService.autocompleteEmails(email);
  }
}
