import { CreateUserNotificationSchema } from "@dbschema/edgedb-zod/modules/users";
import {
  CreateAuthoredNotificationSchema,
  CreateMailingListSchema,
  CreateNotificationSchema,
  CreateNotificationTargetSchema,
  CreateSystemNotificationSchema,
} from "@dbschema/edgedb-zod/modules/notification";
import { createZodDto } from "nestjs-zod";

export class CreateUserNotificationDto extends createZodDto(CreateUserNotificationSchema) {}
export class CreateMailingListDto extends createZodDto(CreateMailingListSchema) {}
export class CreateNotificationDto extends createZodDto(CreateNotificationSchema) {}
export class CreateNotificationTargetDto extends createZodDto(CreateNotificationTargetSchema) {}
export class CreateSystemNotificationDto extends createZodDto(CreateSystemNotificationSchema) {}
export class CreateAuthoredNotificationDto extends createZodDto(CreateAuthoredNotificationSchema) {}
