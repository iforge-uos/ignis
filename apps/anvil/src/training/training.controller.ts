import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import { JwtPayload } from "@/auth/interfaces/jwtpayload.interface";
import { User as GetUser } from "@/shared/decorators/user.decorator";
import verifyJWT from "@/shared/functions/verifyJWT";
import { TrainingService } from "@/training/training.service";
import { std } from "@dbschema/interfaces";
import type { training } from "@ignis/types";
import { PartialTraining } from "@ignis/types/training";
import type { User } from "@ignis/types/users";
import { Body, Controller, ForbiddenException, Get, Logger, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Controller("training")
export class TrainingController {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly logger: Logger,
  ) {}

  @Get()
  async getTrainingLocations() {
    this.logger.log("Retrieving training locations", TrainingController.name);
    return this.trainingService.getAllTrainings();
  }

  @Get(":id")
  async getTraining(@Param("id") id: string, @Req() req: Request): Promise<training.Training> {
    this.logger.log(`Retrieving training with ID: ${id}`, TrainingController.name);
    const editing = req.query.editing === "true";
    if (editing) {
      try {
        const payload = verifyJWT(req.cookies.access_token) as JwtPayload;
        if (!payload.roles?.some((role) => role === process.env.ADMIN_ROLE)) {
          throw new Error();
        }
      } catch (_) {
        throw new ForbiddenException();
      }
    }
    return this.trainingService.getTraining(id, editing);
  }

  @Post(":id/start")
  @UseGuards(AuthGuard("jwt"))
  async startTraining(@Param("id") id: string, @GetUser() user: User) {
    this.logger.log(`Starting training with ID: ${id} for user with ID: ${user.id}`, TrainingController.name);
    return this.trainingService.startTraining(id, user.id);
  }

  @Post("interact/:interaction_id")
  @UseGuards(AuthGuard("jwt"))
  async interactWithTraining(
    @Body("session_id") session_id: string,
    @Param("interaction_id") interaction_id: string,
    @Body("answers") answers: std.BaseObject[] | undefined,
    @GetUser() user: User,
  ) {
    this.logger.log(
      `Interacting with training session: ${session_id}, interaction: ${interaction_id}, user: ${user.id}`,
      TrainingController.name,
    );
    return this.trainingService.interactWithTraining(session_id, interaction_id, answers, user.id);
  }

  @Get("location/:location")
  async trainings(@Param("location") location: training.LocationName): Promise<PartialTraining[]> {
    this.logger.log(`Retrieving trainings for location: ${location}`, TrainingController.name);
    return this.trainingService.getTrainings(location);
  }

  @Get("location/:location/statuses")
  async trainingStatuses(@Req() req: Request, @Param("location") location: training.LocationName) {
    let user_id: string | undefined;
    try {
      const payload = verifyJWT(req.cookies.access_token);
      user_id = payload.sub as unknown as string;
      this.logger.log(
        `Retrieving training statuses for location: ${location}, user: ${user_id}`,
        TrainingController.name,
      );
    } catch (_) {
      user_id = undefined;
      this.logger.log(
        `Retrieving training statuses for location: ${location}, user not authenticated`,
        TrainingController.name,
      );
    }

    return Object.fromEntries(
      ((await this.trainingService.trainingStatuses(location, user_id)) as any).map((entry: any) => [
        entry.id_,
        entry.status,
      ]),
    );
  }
}
