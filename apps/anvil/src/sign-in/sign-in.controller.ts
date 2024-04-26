import { CheckAbilities } from "@/auth/authorization/decorators/check-abilities-decorator";
import { IsRep } from "@/auth/authorization/decorators/check-roles-decorator";
import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import { User } from "@/shared/decorators/user.decorator";
import { TrainingService } from "@/training/training.service";
import { UsersService } from "@/users/users.service";
import { ErrorCodes } from "@/shared/constants/ErrorCodes";
import { sign_in as sign_in_, users } from "@ignis/types";
import type { List, Location } from "@ignis/types/sign_in";
import type { User as User_ } from "@ignis/types/users";
import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { FinaliseSignInDto, RegisterUserDto, UpdateSignInDto } from "./dto/sigs-in-dto";
import { SignInService } from "./sign-in.service";
import { Logger } from "@nestjs/common";

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
  async getList(@Param("location") location: Location) {
    return this.signInService.getList(location);
  }

  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @IsRep()
  @Post("register-user")
  async registerUser(@Param("location") location: Location, @Body() registerUser: RegisterUserDto) {
    this.logger.log(`Registering user: ${registerUser.ucard_number} at location: ${location}`, SignInController.name);
    return this.signInService.registerUser(location, registerUser);
  }

  @Get("sign-in/:ucard_number")
  @IsRep()
  async signInOptions(
    @Param("location") location: Location,
    @Param("ucard_number", ParseIntPipe) ucard_number: number,
  ): Promise<sign_in_.User> {
    this.logger.log(
      `Retrieving sign-in options for UCard number: ${ucard_number} at location: ${location}`,
      SignInController.name,
    );
    const user = await this.userService.findByUcardNumber(ucard_number);
    if (!user) {
      this.logger.warn(`User with UCard number ${ucard_number} is not registered`, SignInController.name);
      throw new NotFoundException({
        message: `User with UCard number ${ucard_number} is not registered`,
        code: ErrorCodes.not_registered,
      });
    }

    if (await this.signInService.isRep(ucard_number)) {
      return {
        // reasons,
        training: await this.signInService.getTrainings(user.id, location),
        ...user,
        ...{ infractions: [] },
      };
    }

    const extras = await this.signInService.preSignInChecks(location, ucard_number);

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
  async signIn(
    @Param("location") location: Location,
    @Param("ucard_number", ParseIntPipe) ucard_number: number,
    @Body() finaliseSignInDto: FinaliseSignInDto,
  ) {
    this.logger.log(`Signing in UCard number: ${ucard_number} at location: ${location}`, SignInController.name);
    if (await this.signInService.isRep(ucard_number)) {
      return await this.signInService.repSignIn(location, ucard_number, finaliseSignInDto.reason_id);
    }

    return await this.signInService.signIn(
      location,
      ucard_number,
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
  async signOut(@Param("location") location: Location, @Param("ucard_number", ParseIntPipe) ucard_number: number) {
    this.logger.log(`Signing out UCard number: ${ucard_number} at location: ${location}`, SignInController.name);
    return await this.signInService.signOut(location, ucard_number);
  }

  @Get("status")
  async getSignInStatus(@Param("location") location: Location) {
    this.logger.log(`Retrieving sign-in status for location: ${location}`, SignInController.name);
    return await this.signInService.getStatusForLocation(location);
  }

  @Post("queue/remotely")
  async addToQueueRemotely(@Param("location") location: Location, @User() user: User_) {
    this.logger.log(
      `Adding user with ID: ${user.id} to queue remotely at location: ${location}`,
      SignInController.name,
    );
    await this.signInService.addToQueue(location, undefined, user.id);
  }

  @Post("queue/in-person/:ucard_number")
  @IsRep()
  async addToQueueInPerson(
    @Param("location") location: Location,
    @Param("ucard_number", ParseIntPipe) ucard_number: number,
  ) {
    this.logger.log(
      `Adding UCard number: ${ucard_number} to queue in-person at location: ${location}`,
      SignInController.name,
    );
    await this.signInService.addToQueue(location, ucard_number);
  }

  @Post("queue/remove/:id")
  @IsRep()
  @CheckAbilities(["READ"], "ALL") // FIXME: needs an any rather than all guard
  async removeFromQueue(@Param("location") location: Location, @Param("id") user_id: string) {
    this.logger.log(`Removing user with ID: ${user_id} from queue at location: ${location}`, SignInController.name);
    await this.signInService.removeFromQueue(location, user_id);
  }

  // FIXME: events sign in
}
