import type { LocationName, QueueEntry } from "@ignis/types/sign_in";
import type { PartialUser } from "@ignis/types/users";
import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bull";
import { render } from "jsx-email";
import { z } from "zod";
import { SendEmailSchema } from "./dto/send-email.dto";
import Queued from "./templates/queued";
import { Unqueued } from "./templates/unqueued";
import { WelcomeEmail } from "./templates/welcome";

@Injectable()
export class EmailService {
  private readonly logger = Logger;

  constructor(@InjectQueue("email") private emailQueue: Queue) {}

  async sendEmail(dto: z.infer<typeof SendEmailSchema>) {
    this.logger.debug("Adding email to queue...", EmailService.name);

    const priority = dto.priority || 2; // Default to medium priority if not specified

    await this.emailQueue.add("sendEmail", dto, {
      priority,
      attempts: 5, // Number of attempts to retry the job
      backoff: 3000, // Delay where retries will be processed (in ms)
    });

    this.logger.debug("Email added to queue successfully", EmailService.name);
  }

  async sendHtml(
    element: React.JSX.Element,
    dto: Omit<z.infer<typeof SendEmailSchema>, "message" | "plainTextMessage">,
  ) {
    await this.sendEmail({
      message: await render(element, { minify: true }),
      plainTextMessage: await render(element, {
        plainText: true,
      }),
      ...dto,
    });
  }

  async sendWelcomeEmail(recipient: PartialUser) {
    await this.sendHtml(WelcomeEmail({ ...recipient }), {
      recipients: [`${recipient.email}@sheffield.ac.uk`],
      subject: "Welcome to the iForge",
    });
  }

  async sendUnqueuedEmail(place: QueueEntry, location: LocationName) {
    await this.sendHtml(Unqueued({ ...place, location }), {
      recipients: [`${place.user.email}@sheffield.ac.uk`],
      subject: `Your place in the iForge ${location}`,
    });
  }

  async sendQueuedEmail(place: QueueEntry, location: LocationName) {
    await this.sendHtml(Queued({ ...place, location }), {
      recipients: [`${place.user.email}@sheffield.ac.uk`],
      subject: `Your place in the iForge ${location}`,
    });
  }
}
