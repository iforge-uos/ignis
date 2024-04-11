import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import { User as GetUser } from "@/shared/decorators/user.decorator";
import verifyJWT from "@/shared/functions/verifyJWT";
import { TrainingService } from "@/training/training.service";
import { std } from "@dbschema/interfaces";
import type { training } from "@ignis/types";
import { PartialTraining } from "@ignis/types/training";
import type { User } from "@ignis/types/users";
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Controller("training")
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  async getTrainingLocations() {
    throw new Error("Not implemented yet"); // soon
  }

  @Get(":id")
  async getTraining(@Param("id") id: string): Promise<training.Training> {
    return this.trainingService.getTraining(id);
  }

  // @Get(":id/status")
  // async getTrainingStatus(@Param("id") id: string): Promise<training.UserTrainingStatus> {
  //   return this.trainingService.getTraining(id);
  // }

  @Post(":id/start")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async startTraining(@Param("id") id: string, @GetUser() user: User) {
    return this.trainingService.startTraining(id, user.id);
  }

  @Post("interact/:interaction_id")
  @UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
  async interactWithTraining(
    @Body("session_id") session_id: string,
    @Param("interaction_id") interaction_id: string,
    @Body("answers") answers: std.BaseObject[] | undefined,
    @GetUser() user: User,
  ) {
    return this.trainingService.interactWithTraining(session_id, interaction_id, answers, user.id);
  }

  @Get("location/:location")
  async trainings(@Param("location") location: training.Location): Promise<PartialTraining[]> {
    return this.trainingService.getTrainings(location);
  }

  @Get("location/:location/statuses")
  async trainingStatuses(@Req() req: Request, @Param("location") location: training.Location) {
    let user_id: string | undefined;
    try {
      const payload = verifyJWT(req.cookies.access_token);
      user_id = payload.sub as unknown as string;
    } catch (_) {
      user_id = undefined;
    }

    return Object.fromEntries(
      ((await this.trainingService.trainingStatuses(location, user_id)) as any).map((entry: any) => [
        entry.id_,
        entry.status,
      ]),
    );
  }
}
