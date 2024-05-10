import { CheckAbilities } from "@/auth/authorization/decorators/check-abilities-decorator";
import { IsAdmin, IsRep } from "@/auth/authorization/decorators/check-roles-decorator";
import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import { ErrorCodes } from "@/shared/constants/ErrorCodes";
import { IdempotencyCache } from "@/shared/decorators/idempotency.decorator";
import { User } from "@/shared/decorators/user.decorator";
import { ldapLibraryToUcardNumber } from "@/shared/functions/utils";
import { IdempotencyCacheInterceptor } from "@/shared/interceptors/idempotency-cache.interceptor";
import { TrainingService } from "@/training/training.service";
import { UsersService } from "@/users/users.service";
import { sign_in as sign_in_ } from "@ignis/types";
import type { List, Location, LocationStatus } from "@ignis/types/sign_in";
import type { User as User_ } from "@ignis/types/users";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FinaliseSignInDto, UpdateSignInDto } from "./dto/sigs-in-dto";
import { SignInService } from "./sign-in.service";

@Controller("location/:location")
@UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
export class SignInController {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly signInService: SignInService,
    private readonly userService: UsersService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @IsRep()
  async getList(@Param("location") location: Location): Promise<List> {
    return this.signInService.getList(location);
  }

  @Get("sign-in/:ucard_number")
  @IsRep()
  async signInOptions(
    @Param("location") location: Location,
    @Param("ucard_number") ucard_number: string,
  ): Promise<sign_in_.User> {
    this.logger.log(
      `Retrieving sign-in options for UCard number: ${ucard_number} at location: ${location}`,
      SignInController.name,
    );
    const user = await this.signInService.getUserForSignIn(location, ucard_number);
    if (user.signed_in) {
      throw new BadRequestException({
        message: "User is already signed in",
        code: ErrorCodes.already_signed_in_to_location,
      });
    }

    if (user?.is_rep) {
      return {
        // reasons,
        training: await this.signInService.getTrainings(user.id, location),
        ...user,
        ...{ infractions: [] },
      };
    }

    const extras = await this.signInService.preSignInChecks(location, user.ucard_number);

    // const [trainings, reasons] = await Promise.all([
    //   this.trainingService.getUserxxTrainingForLocation(user.username, location),
    //   this.signInService.getSignInReasons(),
    // ]);
    return {
      // reasons,
      training: await this.signInService.getTrainings(user.id, location),
      ...user,
      ...extras,
    };
  }

  @Post("sign-in/:ucard_number")
  @IsRep()
  @UseInterceptors(IdempotencyCacheInterceptor)
  @IdempotencyCache(60)
  async signIn(
    @Param("location") location: Location,
    @Param("ucard_number") ucard_number: string,
    @Body() finaliseSignInDto: FinaliseSignInDto,
  ) {
    this.logger.log(`Signing in UCard number: ${ucard_number} at location: ${location}`, SignInController.name);
    const ucard_number_ = ldapLibraryToUcardNumber(ucard_number);
    if (await this.signInService.isRep(ucard_number_)) {
      return await this.signInService.repSignIn(location, ucard_number_, finaliseSignInDto.reason_id);
    }

    return await this.signInService.signIn(
      location,
      ucard_number_,
      finaliseSignInDto.tools,
      finaliseSignInDto.reason_id,
    );
  }

  @Patch("sign-in/:ucard_number")
  @IsRep()
  async updateVisitPurpose(
    @Param("location") location: Location,
    @Param("ucard_number", ParseIntPipe) ucard_number: number,
    @Body() updateSignInDto: UpdateSignInDto,
  ) {
    this.logger.log(
      `Updating visit purpose for UCard number: ${ucard_number} at location: ${location}`,
      SignInController.name,
    );
    return await this.signInService.updateVisitPurpose(
      location,
      ucard_number,
      updateSignInDto.tools,
      updateSignInDto.reason_id,
    );
  }

  @Post("sign-out/:ucard_number")
  @IsRep()
  @UseInterceptors(IdempotencyCacheInterceptor)
  @IdempotencyCache(60)
  async signOut(@Param("location") location: Location, @Param("ucard_number") ucard_number: string) {
    this.logger.log(`Signing out UCard number: ${ucard_number} at location: ${location}`, SignInController.name);
    return await this.signInService.signOut(location, ldapLibraryToUcardNumber(ucard_number));
  }

  @Get("status")
  async getLocationStatus(@Param("location") location: Location): Promise<LocationStatus> {
    this.logger.log(`Retrieving sign-in status for location: ${location}`, SignInController.name);
    return await this.signInService.getStatusForLocation(location);
  }

  // @Post("queue/remotely")
  // @IdempotencyCache(60)
  // async addToQueueRemotely(@Param("location") location: Location, @User() user: User_) {
  //   this.logger.log(
  //     `Adding user with ID: ${user.id} to queue remotely at location: ${location}`,
  //     SignInController.name,
  //   );
  //   await this.signInService.addToQueue(location, undefined, user.id);
  // }

  @Post("queue")
  @IsRep()
  @UseInterceptors(IdempotencyCacheInterceptor)
  @IdempotencyCache(60)
  async addToQueueInPerson(@Param("location") location: Location, @Body("ucard_number") ucard_number: string) {
    this.logger.log(
      `Adding UCard number: ${ucard_number} to queue in-person at location: ${location}`,
      SignInController.name,
    );
    return await this.signInService.addToQueue(location, ucard_number);
  }

  @Delete("queue/:id")
  @IsRep()
  @UseInterceptors(IdempotencyCacheInterceptor)
  @CheckAbilities(["READ"], "ALL") // FIXME: needs an any rather than all guard also allows for users to remove themselves
  @IdempotencyCache(60)
  async removeFromQueue(@Param("location") location: Location, @Param("id") id: string) {
    this.logger.log(`Removing queue request with ID: ${id} from queue at location: ${location}`, SignInController.name);
    return await this.signInService.removeFromQueue(location, id);
  }

  // FIXME: events sign in

  @Get("/common-reasons")
  @IsRep()
  async getPopularSignInReasons(@Param("location") location: Location) {
    return this.signInService.getPopularSignInReasons(location);
  }
}
