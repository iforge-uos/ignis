import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Injectable()
export class CleanupService implements OnModuleInit {
  constructor(@InjectQueue("cleanup") private readonly cleanupQueue: Queue) {}

  onModuleInit() {
    // Schedule the job to run every day at 2AM
    this.cleanupQueue.add("removeExpiredTokens", {}, { repeat: { cron: "0 2 * * *" } });
  }
}
