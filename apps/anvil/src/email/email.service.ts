import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import type { Location } from "@ignis/types/sign_in";
import type { PartialUser } from "@ignis/types/users";
import { Queue } from "bull";
import { render } from "jsx-email";
import { SendEmailSchema } from "./dto/send-email.dto";
import { Unqueued } from "./templates/unqueued";
import { WelcomeEmail } from "./templates/welcome";
import { z } from "zod";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(@InjectQueue("email") private emailQueue: Queue) {}

  async sendEmail(dto: z.infer<typeof SendEmailSchema>) {
    this.logger.debug("Adding email to queue...");

    const priority = dto.priority || 2; // Default to medium priority if not specified

    await this.emailQueue.add("sendEmail", dto, {
      priority,
      attempts: 5, // Number of attempts to retry the job
      backoff: 3000, // Delay where retries will be processed (in ms)
    });

    this.logger.debug("Email added to queue successfully");
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
      recipients: [recipient.email + "@sheffield.ac.uk"],
      subject: `Welcome to the iForge`,
    });
  }

  async sendUnqueuedEmail(recipient: PartialUser, location: Location) {
    await this.sendHtml(Unqueued({ ...recipient, location }), {
      recipients: [recipient.email + "@sheffield.ac.uk"],
      subject: `Your place in the iForge ${location}`,
    });
  }
}
