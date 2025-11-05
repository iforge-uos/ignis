import client from "@/db";
import env from "@/lib/env";
import { PartialUserShape } from "@/lib/utils/queries";
import e from "@packages/db/edgeql-js";
import { LocationName, QueueEntry } from "@packages/types/sign_in";
import { PartialUser } from "@packages/types/users";
import * as Sentry from "@sentry/tanstackstart-react";
import { logger } from "@sentry/tanstackstart-react";
import Bull from "bull";
import { render } from "jsx-email";
import * as nodemailer from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import React from "react";
// import { Template as QueuedTemplate } from "@packages/email/queued";
// import { Template as UnqueuedTemplate } from "./unqueued";
// import { Template as WelcomeTemplate } from "./welcome";
import { toTitleCase } from "@/lib/utils";

interface Email {
  recipients: string[];
  subject: string;
  message: string;
  plainTextMessage?: string;
  priority?: number; // [1, 10] default to 2 (medium priority)
}

class Emailer {
  private emailQueue: Bull.Queue<Email>;
  private transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor() {
    logger.info(logger.fmt`Initializing EmailService - Redis: ${env.redis.host}:${env.redis.port} DB:${env.redis.db}`);

    this.transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: false,
      requireTLS: env.email.smtpRequireTls,
      auth: {
        user: env.email.auth.user,
        pass: env.email.auth.pass,
      },
      name: env.email.localDomain,
    });

    this.emailQueue = new Bull("email", {
      redis: {
        host: env.redis.host,
        port: env.redis.port,
        password: env.redis.password,
        db: Number.parseInt(env.redis.db),
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    this.emailQueue.process("sendEmail", async (job) => {
      const emailData = job.data;
      logger.debug(logger.fmt`Processing email job: ${emailData.subject} to ${emailData.recipients.length} recipients`);

      const { recipients, subject, message, plainTextMessage } = emailData;

      try {
        const info = await this.transporter.sendMail({
          from: "iForge No-Reply <iforge@sheffield.ac.uk>",
          replyTo: "noreply@iforge.sheffield.ac.uk",
          to: recipients.length === 1 ? recipients : undefined,
          bcc: recipients.length !== 1 ? recipients : undefined,
          subject,
          text: plainTextMessage ?? message,
          html: message,
        });
        logger.debug(logger.fmt`Email sent successfully: ${subject} - MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        logger.error(
          logger.fmt`Email sending failed: ${subject} - ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        throw new Error("Failed to send email");
      }
    });

    this.emailQueue.on("completed", (job) => {
      logger.debug(logger.fmt`Email job completed: ${job.id}`);
    });

    this.emailQueue.on("failed", (job, err) => {
      logger.error(logger.fmt`Email job failed: ${job.id} - ${err.message}`);

      Sentry.captureException(err, {
        tags: {
          jobId: job.id?.toString(),
        },
        extra: {
          jobData: job.data,
        },
      });
    });
  }

  async send(email: Email, delay = 0) {
    try {
      logger.debug(
        logger.fmt`Adding email to queue: ${email.subject} to ${email.recipients.length} recipients (delay: ${delay}ms)`,
      );

      const priority = email.priority || 2;

      await this.emailQueue.add("sendEmail", email, {
        priority,
        delay,
        attempts: 5,
        backoff: 3_000,
      });

      logger.debug(logger.fmt`Email added to queue successfully: ${email.subject}`);
    } catch (error) {
      logger.error(
        logger.fmt`Failed to add email to queue: ${email.subject} - ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      Sentry.captureException(error, {
        extra: {
          emailData: email,
          delay,
        },
      });
      throw error;
    }
  }

  async sendJSX(element: React.JSX.Element, email: Omit<Email, "message" | "plainTextMessage">, delay = 0) {
    try {
      const message = await render(element, { minify: true });
      const plainTextMessage = await render(element, { plainText: true });

      await this.send(
        {
          message,
          plainTextMessage,
          ...email,
        },
        delay,
      );
    } catch (error) {
      logger.error(
        logger.fmt`Failed to send HTML email: ${email.subject} - ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      Sentry.captureException(error, {
        extra: {
          emailData: email,
          delay,
        },
      });
      throw error;
    }
  }

  async sendWelcomeEmail(recipient: PartialUser) {
    await this.sendJSX(WelcomeTemplate({ ...recipient }), {
      recipients: [`${recipient.email}@sheffield.ac.uk`],
      subject: "Welcome to the iForge",
    });

    logger.info(logger.fmt`Welcome email sent successfully to ${recipient.display_name} (${recipient.email})`);
  }

  async sendQueuedEmail(place: QueueEntry, location: LocationName) {
    await this.sendJSX(QueuedTemplate({ ...place, location }), {
      recipients: [`${place.user.email}@sheffield.ac.uk`],
      subject: `You've queued for the iForge ${toTitleCase(location)}`,
    });

    logger.info(
      logger.fmt`Queued email scheduled for ${place.user.display_name} (${place.user.ucard_number}) for ${location}`,
    );
  }

  // TODO this should reply to the original email
  async sendUnqueuedEmail(place: QueueEntry, location: LocationName) {
    await this.sendJSX(UnqueuedTemplate({ ...place, location }), {
      recipients: [`${place.user.email}@sheffield.ac.uk`],
      subject: `You have a place available in the iForge ${toTitleCase(location)}`,
    });

    logger.info(
      logger.fmt`Unqueued email scheduled for ${place.user.display_name} (${place.user.ucard_number}) for ${location}`,
    );
  }

  async sendAgreementUpdate() {
    try {
      const agreement = await e
        .assert_exists(
          e.select(e.sign_in.Agreement, () => ({
            ...e.sign_in.Agreement["*"],
            reasons: e.sign_in.Reason["*"],
            filter_single: { id: "5f0c60d4-f86c-11ee-8cfe-2b55746f63b3" },
          })),
        )
        .run(client);

      const users = await e
        .select(e.users.User, (user) => ({
          filter: e.op(
            e.op(e.uuid(agreement.id), "in", user.agreements_signed.id),
            "and",
            e.op(user.agreements_signed["@version_signed"], "!=", agreement.version),
          ),
          ...PartialUserShape(user),
        }))
        .run(client);

      logger.info(
        logger.fmt`Starting bulk agreement update email send for agreement ${agreement.id} to ${users.length} users`,
      );

      for (const [index, user] of users.entries()) {
        // add incremental delay (e.g. 1000ms between each email)
        const delay = index * 1000;

        try {
          // Simple agreement update email - create a proper template later
          await this.send(
            {
              recipients: [`${user.email}@sheffield.ac.uk`],
              subject: "An update to our Agreement",
              message: `<h1>Agreement Update</h1><p>There has been an update to our agreement.</p>`,
              plainTextMessage: "Agreement Update: There has been an update to our agreement.",
            },
            delay,
          );

          logger.debug(
            logger.fmt`Agreement update email queued for ${user.email} with ${delay}ms delay (${index + 1}/${users.length})`,
          );
        } catch (error) {
          logger.error(
            logger.fmt`Failed to queue agreement update email for ${user.email} - ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          // Don't throw here, continue with other emails
        }
      }

      logger.info(
        logger.fmt`Bulk agreement update email send completed for agreement ${agreement.id} to ${users.length} users`,
      );
    } catch (error) {
      logger.error(
        logger.fmt`Failed to send agreement update emails - ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      Sentry.captureException(error);
      throw error;
    }
  }
}

const emailClient = new Emailer();
export default emailClient;