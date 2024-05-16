import { IsAdmin, IsRep } from "@/auth/authorization/decorators/check-roles-decorator";
import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import { GoogleService } from "@/google/google.service";
import { User as GetUser } from "@/shared/decorators/user.decorator";
import { SignInService } from "@/sign-in/sign-in.service";
import type { User } from "@ignis/types/users";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { CreateAgreementDto, UpdateAgreementDto } from "./dto/agreement.dto";
import { CreateSignInReasonCategoryDto } from "./dto/reason.dto";
import { RootService } from "./root.service";
import { Logger } from "@nestjs/common";
import { EmailService } from "@/email/email.service";
import { IdempotencyCacheInterceptor } from "@/shared/interceptors/idempotency-cache.interceptor";
import { IdempotencyCache } from "@/shared/decorators/idempotency.decorator";

@Controller()
@UseInterceptors(IdempotencyCacheInterceptor)
export class RootController {
  constructor(
    private readonly signInService: SignInService,
    private readonly emailService: EmailService,
    private readonly rootService: RootService,
    private readonly googleService: GoogleService,
    private readonly logger: Logger,
  ) {}

  @Get("status")
  async getStatus() {
    return await this.rootService.getStatus();
  }

  @Get("sign-in-reasons-last-update")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async optionsSignInReasons(@Res() resp: Response) {
    this.logger.log("Retrieving sign-in reasons last update", RootController.name);
    const last_modified = await this.signInService.getSignInReasonsLastUpdate();
    resp.setHeader("Last-Modified", last_modified.toUTCString());
    return resp.send();
  }

  @Get("sign-in-reasons")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async getSignInReasons() {
    this.logger.log("Retrieving sign-in reasons", RootController.name);
    return await this.signInService.getSignInReasons();
  }

  @Post("sign-in-reasons")
  @IdempotencyCache(60)
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async addSignInReason(@Body() reason: CreateSignInReasonCategoryDto) {
    this.logger.log("Adding sign-in reason", RootController.name);
    return await this.signInService.addSignInReason(reason);
  }

  @Delete("sign-in-reasons/:id")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async deleteSignInReason(@Param("id") id: string) {
    this.logger.log(`Deleting sign-in reason with ID: ${id}`, RootController.name);
    return await this.signInService.deleteSignInReason(id);
  }

  @Get("agreements")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async getAgreements() {
    this.logger.log("Retrieving agreements", RootController.name);
    return this.rootService.getAgreements();
  }

  @Post("agreements")
  @IsAdmin()
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  @IdempotencyCache(60)
  async createAgreement(@Body() body: CreateAgreementDto) {
    this.logger.log("Creating agreement", RootController.name);
    return await this.rootService.createAgreement(body.reason_ids, body.content);
  }

  @Get("agreements/:agreement_id")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async getAgreement(@Param("agreement_id") reason_id: string) {
    this.logger.log(`Retrieving agreement with ID: ${reason_id}`, RootController.name);
    return await this.rootService.getAgreement(reason_id);
  }

  @Post("agreements/:agreement_id")
  @IdempotencyCache(60)
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async signAgreement(@Param("agreement_id") agreement_id: string, @GetUser() user: User) {
    this.logger.log(`Signing agreement with ID: ${agreement_id} by user with ID: ${user.id}`, RootController.name);
    return await this.rootService.signAgreement(agreement_id, user);
  }

  @Patch("agreements/:agreement_id")
  @IsAdmin()
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async updateAgreement(@Param("agreement_id") agreement_id: string, @Body() body: UpdateAgreementDto) {
    this.logger.log(`Updating agreement with ID: ${agreement_id}`, RootController.name);
    return await this.rootService.updateAgreement(agreement_id, body.reason_ids, body.content);
  }

  @Post("test_email")
  @IsAdmin()
  @IdempotencyCache(60)
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async testEmail(@GetUser() user: User) {
    this.logger.log(`Sending email to ${user.email}`, RootController.name);
    return await this.emailService.sendWelcomeEmail(user);
  }

  @Get("teams")
  @IsRep()
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async getTeams() {
    this.logger.log("Retrieving teams", RootController.name);
    return await this.rootService.getTeams();
  }

  //@Get("autocomplete") Removed as unused
  // @UseGuards(AuthGuard('jwt'), CaslAbilityGuard)
  // @IsAdmin()
  async getAutocomplete(@Query("email") email: string) {
    this.logger.log(`Retrieving autocomplete suggestions for email: ${email}`, RootController.name);
    return await this.googleService.autocompleteEmails(email);
  }
}
