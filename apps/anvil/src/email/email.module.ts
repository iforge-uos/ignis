import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { EmailService } from "./email.service";
import { EmailController } from "./email.controller";
import { EmailProcessor } from "./email.processor";
import { FiltersModule } from "@/filters/filters.module";

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: "email",
      imports: [FiltersModule],
      useFactory: async () => {
        const redisConfig: any = {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          db: process.env.REDIS_DB,
        };

        const password = process.env.REDIS_PASSWORD;
        if (password) {
          redisConfig.password = password;
        }
        const limiter: any = {
          max: parseInt(process.env.EMAIL_RATE_MAX!),
          duration: parseInt(process.env.EMAIL_RATE_DURATION!),
        };

        return {
          redis: redisConfig,
          limiter,
        };
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailProcessor],
})
export class EmailModule {}
