import config from "@/config";
import { QueueEntry } from "@ignis/types/sign_in";
import { LocationName } from "@ignis/types/training";
import { PartialUser } from "@ignis/types/users";
import Bull from "bull";
import { render } from "jsx-email";
import nodemailer from "nodemailer";
import { Logger } from "winston";
import { z } from "zod/v4";
// import { Template as Queued } from "../../../../packages/email/queued";
// import { Template as Unqueued } from "../../../../packages/email/unqueued";
// import WelcomeEmail from "./templates/welcome";

export type SendEmailSchema = z.infer<typeof SendEmailSchema>;
export const SendEmailSchema = z.object({
  recipients: z.array(z.string().email()),
  subject: z.string().max(255),
  plainTextMessage: z.string().optional(),
  priority: z.number().int().min(1).max(69).optional().nullable(), // Priority: 1 for high, 2 for medium, 3 for low, etc.
  message: z.string().optional(),
});

class EmailService {
  private logger: Logger;
  private queue: Bull.Queue<SendEmailSchema>;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.logger = config.logging.logger;

    this.queue = new Bull("email-queue", {
      redis: config.redis.host,
    });

    // Setup Nodemailer
    this.transporter = nodemailer.createTransport(config.email);

    this.queue.process("send", async ({ data: { recipients, subject, message, plainTextMessage } }) => {
      await this.transporter.sendMail({
        to: recipients,
        subject,
        text: plainTextMessage,
        html: message,
      });
    });
  }

  async sendEmail(dto: SendEmailSchema) {
    this.logger.debug("Adding email to queue...", EmailService.name);

    const priority = dto.priority || 2; // Default to medium priority if not specified

    await this.queue.add("send", dto, {
      priority,
      attempts: 5, // Number of attempts to retry the job
      backoff: 3000, // Delay where retries will be processed (in ms)
    });

    this.logger.debug("Email added to queue successfully", EmailService.name);
  }

  async sendHtml(element: React.JSX.Element, dto: Omit<SendEmailSchema, "message" | "plainTextMessage">) {
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

export default new EmailService();
