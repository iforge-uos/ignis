import { Module } from "@nestjs/common";
import { EmailExceptionFilter } from "./email/email.filter";

@Module({
  providers: [EmailExceptionFilter],
  exports: [EmailExceptionFilter],
})
export class FiltersModule {}
