import { IsAdmin, IsRep } from "@/auth/authorization/decorators/check-roles-decorator";
import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import type { UpdateUserSchema } from "@dbschema/edgedb-zod/modules/users";
import { sign_in, training, users } from "@ignis/types";
import { LocationName } from "@ignis/types/sign_in";
import type { Training, User } from "@ignis/types/users";
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { z } from "zod";
import { User as GetUser } from "../shared/decorators/user.decorator";
import type {
  AddInPersonTrainingDto,
  CreateInfractionDto,
  CreateUserDto,
  PromoteUserDto,
  RevokeTrainingDto,
  UpdateUserDto,
} from "./dto/users.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: Logger,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Creating user with data: ${JSON.stringify(createUserDto)}`, UsersController.name);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @IsRep()
  async findAll() {
    this.logger.log("Retrieving all users", UsersController.name);
    return this.usersService.findAll();
  }

  @Get("me")
  async findSelf(@GetUser() user: User) {
    this.logger.log(`Retrieving self user with ID: ${user.id}`, UsersController.name);
    return user;
  }

  @Patch("me")
  async updateSelf(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    const EDITABLE_FIELDS = ["display_name", "pronouns"];
    const data = Object.fromEntries(Object.entries(updateUserDto).filter(([key]) => key in EDITABLE_FIELDS));
    this.logger.log(`Updating self user with ID: ${user.id}, data: ${JSON.stringify(data)}`, UsersController.name);
    return this.usersService.update(user.id, data as z.infer<typeof UpdateUserSchema>);
  }

  @Get(":id")
  @IsRep()
  async findOne(@Param("id") id: string) {
    this.logger.log(`Retrieving user with ID: ${id}`, UsersController.name);
    const user = await this.usersService.findOne(id);
    if (!user) {
      this.logger.warn(`User with ID: ${id} not found`, UsersController.name);
      throw new NotFoundException("User not found");
    }
    return user;
  }

  @Patch(":id")
  @IsRep()
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}, data: ${JSON.stringify(updateUserDto)}`, UsersController.name);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @IsRep()
  async remove(@Param("id") id: string) {
    this.logger.log(`Removing user with ID: ${id}`, UsersController.name);
    return this.usersService.remove(id);
  }

  @Get(":id/training")
  @IsRep()
  async getTraining(@Param("id") id: string): Promise<Training[]> {
    this.logger.log(`Retrieving training for user with ID: ${id}`, UsersController.name);
    return this.usersService.getUserTraining(id);
  }

  @Get(":id/training/remaining/:location")
  @IsRep()
  async getRemainingTraining(
    @Param("id") id: string,
    @Param("location") location: LocationName,
  ): Promise<sign_in.Training[]> {
    this.logger.log(`Retrieving remaining training for user with ID: ${id}`, UsersController.name);
    return this.usersService.getUserTrainingInPersonTrainingRemaining(id, location);
  }

  @Post(":id/training/:training_id")
  @IsAdmin()
  async addTraining(
    @Param("id") id: string,
    @Param("training_id") training_id: string,
    @Body() data: AddInPersonTrainingDto,
  ) {
    this.logger.log(
      `Adding training with ID: ${training_id} to user with ID: ${id}, data: ${JSON.stringify(data)}`,
      UsersController.name,
    );
    return this.usersService.addInPersonTraining(id, training_id, data);
  }

  @Delete(":id/training/:training_id")
  @IsRep()
  async revokeTraining(
    @Param("id") id: string,
    @Param("training_id") training_id: string,
    @Body() data: RevokeTrainingDto,
  ) {
    this.logger.log(
      `Revoking training with ID: ${training_id} from user with ID: ${id}, data: ${JSON.stringify(data)}`,
      UsersController.name,
    );
    return this.usersService.revokeTraining(id, training_id, data);
  }

  @Post(":id/infractions")
  @IsAdmin()
  async addInfraction(@Param("id") id: string, @Body() data: CreateInfractionDto) {
    this.logger.log(`Adding infraction to user with ID: ${id}, data: ${JSON.stringify(data)}`, UsersController.name);
    return this.usersService.addInfraction(id, data);
  }

  @Patch(":id/promote")
  @IsAdmin()
  async promoteUser(@Param("id") id: string, @Body() data: PromoteUserDto) {
    this.logger.log(`Promoting user with ID: ${id} to teams: ${JSON.stringify(data.team_ids)}`, UsersController.name);
    return this.usersService.promoteUserToRep(id, data.team_ids);
  }

  @Get(":id/sign-ins")
  @IsRep()
  async getSignIns(@Param("id") id: string) {
    this.logger.log(`Retrieving sign-ins for user with ID: ${id}`, UsersController.name);
    return this.usersService.signInStats(id);
  }
}
