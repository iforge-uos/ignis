import { CaslAbilityGuard } from "@/auth/authorization/guards/casl-ability.guard";
import { NotificationsService } from "@/notifications/notifications.service";
import { Controller, Get, Logger, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller("notifications")
@UseGuards(AuthGuard("jwt"), CaslAbilityGuard)
export class NotificationsController {
  constructor(
    private readonly notiService: NotificationsService,
    private readonly logger: Logger,
  ) {}

  @Get("mailing-lists")
  async findAllMailingLists() {
    this.logger.log("Retrieving all mailing lists", NotificationsController.name);
    return this.notiService.getMailingLists(true);
  }
}
