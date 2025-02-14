import { EdgeDBService } from "@/edgedb/edgedb.service";
import { BullModule } from "@nestjs/bull";
import { Logger, Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailProcessor } from "./email.processor";
import { EmailService } from "./email.service";

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: "email",
      imports: [],
      useFactory: async () => {
        const redisConfig: any = {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          db: process.env.REDIS_DB,
          password: process.env.REDIS_PASSWORD,
        };

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
    EdgeDBService,
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailProcessor, Logger, EdgeDBService],
})
export class EmailModule {}
