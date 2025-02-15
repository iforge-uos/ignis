// email.processor.ts
import { Logger } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";
import * as nodemailer from "nodemailer";
import { Job } from "bull";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import { SendEmailSchema } from "./dto/send-email.dto";
import { z } from "zod";
const fs = require("fs");

@Processor("email")
export class EmailProcessor {
  private readonly transporter: nodemailer.Transporter<SentMessageInfo>;
  private readonly logger = new Logger();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: false,
      requireTLS: process.env.EMAIL_SMTP_REQUIRE_TLS === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      name: process.env.EMAIL_LOCAL_DOMAIN,
    });
  }

  @Process("sendEmail")
  async processEmail(job: Job<z.infer<typeof SendEmailSchema>>) {
    this.logger.debug("Sending email...", EmailProcessor.name);

    const { recipients, subject, message, plainTextMessage } = job.data;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipients,
      subject,
      text: plainTextMessage, // Use plainTextMessage
      html: message,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.debug("Email sent successfully", EmailProcessor.name);
    } catch (error) {
      this.logger.error("Email sending failed:", (error as Error).stack, EmailProcessor.name);
      throw new Error("Failed to send email");
    }
  }
}
