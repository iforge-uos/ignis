import { EdgeDBService } from "@/edgedb/edgedb.service";
import { PartialUserProps } from "@/users/users.service";
import e from "@dbschema/edgeql-js";
import { Agreement } from "@ignis/types/root";
import type { LocationName, QueueEntry } from "@ignis/types/sign_in";
import type { PartialUser } from "@ignis/types/users";
import { InjectQueue } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bull";
import { render } from "jsx-email";
import { z } from "zod";
import { SendEmailSchema } from "./dto/send-email.dto";
import { AgreementUpdate } from "./templates/agreement_update";
import Queued from "./templates/queued";
import { Unqueued } from "./templates/unqueued";
import { WelcomeEmail } from "./templates/welcome";

@Injectable()
export class EmailService {
  private readonly logger = Logger;

  constructor(
    @InjectQueue("email") private emailQueue: Queue,
    private readonly dbService: EdgeDBService,
  ) {}

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

  async sendAgreementUpdate() {
    const agreement = await this.dbService.query(
      e.assert_exists(
        e.select(e.sign_in.Agreement, () => ({
          ...e.sign_in.Agreement["*"],
          reasons: e.sign_in.Reason["*"],
          filter_single: { id: "5f0c60d4-f86c-11ee-8cfe-2b55746f63b3" },
        })),
      ),
    );
    const users = await this.dbService.query(
      e.select(e.users.User, (user) => ({
        filter: e.op(
          e.op(e.uuid(agreement.id), "in", user.agreements_signed.id),
          "and",
          e.op(user.agreements_signed["@version_signed"], "!=", agreement.version),
        ),
        ...PartialUserProps(user),
      })),
    );

    for (const user of users) {
      await this.sendHtml(AgreementUpdate({ agreement, user }), {
        recipients: [`${user.email}@sheffield.ac.uk`],
        subject: "An update to our Agreement",
      });
    }
  }
}
