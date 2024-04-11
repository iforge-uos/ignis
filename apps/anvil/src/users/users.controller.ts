import { CheckAbilities } from "@/auth/authorization/decorators/check-abilities-decorator";
import { IsAdmin } from "@/auth/authorization/decorators/check-roles-decorator";
import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import type { UpdateUserSchema } from "@dbschema/edgedb-zod/modules/users";
import { users } from "@ignis/types";
import type { Training, User } from "@ignis/types/users";
import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { z } from "zod";
import { User as GetUser } from "../shared/decorators/user.decorator";
import type {
  AddInPersonTrainingDto,
  CreateInfractionDto,
  CreateUserDto,
  RevokeTrainingDto,
  UpdateUserDto,
} from "./dto/users.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CheckAbilities(["CREATE"], "USER")
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @CheckAbilities(["READ"], "USER")
  async findAll() {
    return this.usersService.findAll();
  }

  @Get("me") // Get own user data
  @CheckAbilities(["READ"], "SELF")
  async findSelf(@GetUser() user: User) {
    return user;
  }

  @Patch("me") // Update own user data
  @CheckAbilities(["UPDATE"], "SELF")
  async updateSelf(@GetUser() user: User, @Body() updateUserDto: UpdateUserDto) {
    // TODO add multis here
    const EDITABLE_FIELDS = [
      // don't let users edit more than this
      "first_name",
      "last_name",
      "display_name",
      "organisational_unit",
      "pronouns",
    ];
    const data = Object.fromEntries(Object.entries(updateUserDto).filter(([key]) => key in EDITABLE_FIELDS));
    return this.usersService.update(user.id, data as z.infer<typeof UpdateUserSchema>);
  }

  @Get(":id") // Get any user's data (admin/higher permission)
  @CheckAbilities(["READ"], "USER")
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  @Patch(":id") // Update any user's data (admin/higher permission)
  @CheckAbilities(["UPDATE"], "USER")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @CheckAbilities(["DELETE"], "USER")
  async remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @Get(":id/training")
  @CheckAbilities(["READ"], "USER")
  async getTraining(@Param("id") id: string): Promise<Training[]> {
    return this.usersService.getUserTraining(id);
  }

  @Get(":id/training/remaining")
  @CheckAbilities(["READ"], "USER")
  async getRemainingTraining(@Param("id") id: string): Promise<users.UserInPersonTrainingRemaining[]> {
    return this.usersService.getUserTrainingInPersonTrainingRemaining(id);
  }

  @Post(":id/training/:training_id")
  @IsAdmin()
  async addTraining(
    @Param("id") id: string,
    @Param("training_id") training_id: string,
    @Body() data: AddInPersonTrainingDto,
  ) {
    return this.usersService.addInPersonTraining(id, training_id, data);
  }

  @Delete(":id/training/:training_id")
  @CheckAbilities(["READ"], "USER")
  async revokeTraining(
    @Param("id") id: string,
    @Param("training_id") training_id: string,
    @Body() data: RevokeTrainingDto,
  ) {
    return this.usersService.revokeTraining(id, training_id, data);
  }

  @Post(":id/infractions")
  @IsAdmin()
  async addInfraction(@Param("id") id: string, @Body() data: CreateInfractionDto) {
    return this.usersService.addInfraction(id, data);
  }

  @Patch(":id/promote/:teamid")
  @IsAdmin()
  async promoteUser(@Param("id") id: string, @Param("teamid") teamid: string) {
    return this.usersService.promoteUserToRep(id, teamid);
  }

  @Get(":id/sign-ins")
  @CheckAbilities(["READ"], "USER")
  async getSignIns(@Param("id") id: string) {
    return await this.usersService.signInStats(id);
  }
}
