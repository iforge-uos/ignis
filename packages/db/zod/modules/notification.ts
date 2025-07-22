import * as z from "zod";
import * as zt from "zod-temporal";

// #region notification::AllTargetTarget
export const AllTargetTargetSchema = z.enum(["ALL", "REPS"]);
// #endregion

// #region notification::DeliveryMethod
export const DeliveryMethodSchema = z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]);
// #endregion

// #region notification::Status
export const StatusSchema = z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]);
// #endregion

// #region notification::Type
export const TypeSchema = z.enum([
  "ADMIN",
  "ADVERT",
  "ANNOUNCEMENT",
  "EVENT",
  "HEALTH_AND_SAFETY",
  "INFRACTION",
  "PRINTING",
  "QUEUE_SLOT_ACTIVE",
  "RECRUITMENT",
  "REFERRAL",
  "REMINDER",
  "TRAINING",
]);
// #endregion

// #region notification::AllTarget
export const CreateAllTargetSchema = z.object({
  target: z.enum(["ALL", "REPS"]), // notification::AllTargetTarget
});

export const UpdateAllTargetSchema = z.object({
  target: z.enum(["ALL", "REPS"]), // notification::AllTargetTarget
});
// #endregion

// #region notification::AuthoredNotification
export const CreateAuthoredNotificationSchema = z
  .object({
    // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: zt.zonedDateTime().optional(), // std::datetime
    priority: z.int().min(-32768).max(32767).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum([
      "ADMIN",
      "ADVERT",
      "ANNOUNCEMENT",
      "EVENT",
      "HEALTH_AND_SAFETY",
      "INFRACTION",
      "PRINTING",
      "QUEUE_SLOT_ACTIVE",
      "RECRUITMENT",
      "REFERRAL",
      "REMINDER",
      "TRAINING",
    ]), // notification::Type
  })
  .extend({
    // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // notification::AuthoredNotification
    approved_on: zt.zonedDateTime().nullable(), // std::datetime
  });

export const UpdateAuthoredNotificationSchema = z
  .object({
    // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: zt.zonedDateTime().optional(), // std::datetime
    priority: z.int().min(-32768).max(32767).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum([
      "ADMIN",
      "ADVERT",
      "ANNOUNCEMENT",
      "EVENT",
      "HEALTH_AND_SAFETY",
      "INFRACTION",
      "PRINTING",
      "QUEUE_SLOT_ACTIVE",
      "RECRUITMENT",
      "REFERRAL",
      "REMINDER",
      "TRAINING",
    ]), // notification::Type
  })
  .extend({
    // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
  })
  .extend({
    // notification::AuthoredNotification
    approved_on: zt.zonedDateTime().nullable(), // std::datetime
  });
// #endregion

// #region notification::MailingList
export const CreateMailingListSchema = z
  .object({
    // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // notification::MailingList
    description: z.string(), // std::str
    name: z.string(), // std::str
  });

export const UpdateMailingListSchema = z
  .object({
    // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
  })
  .extend({
    // notification::MailingList
    description: z.string(), // std::str
    name: z.string(), // std::str
  });
// #endregion

// #region notification::Notification
export const CreateNotificationSchema = z
  .object({
    // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: zt.zonedDateTime().optional(), // std::datetime
    priority: z.int().min(-32768).max(32767).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum([
      "ADMIN",
      "ADVERT",
      "ANNOUNCEMENT",
      "EVENT",
      "HEALTH_AND_SAFETY",
      "INFRACTION",
      "PRINTING",
      "QUEUE_SLOT_ACTIVE",
      "RECRUITMENT",
      "REFERRAL",
      "REMINDER",
      "TRAINING",
    ]), // notification::Type
  });

export const UpdateNotificationSchema = z
  .object({
    // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
  })
  .extend({
    // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: zt.zonedDateTime().optional(), // std::datetime
    priority: z.int().min(-32768).max(32767).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum([
      "ADMIN",
      "ADVERT",
      "ANNOUNCEMENT",
      "EVENT",
      "HEALTH_AND_SAFETY",
      "INFRACTION",
      "PRINTING",
      "QUEUE_SLOT_ACTIVE",
      "RECRUITMENT",
      "REFERRAL",
      "REMINDER",
      "TRAINING",
    ]), // notification::Type
  });
// #endregion

// #region notification::SystemNotification
export const CreateSystemNotificationSchema = z
  .object({
    // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: zt.zonedDateTime().optional(), // std::datetime
    priority: z.int().min(-32768).max(32767).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum([
      "ADMIN",
      "ADVERT",
      "ANNOUNCEMENT",
      "EVENT",
      "HEALTH_AND_SAFETY",
      "INFRACTION",
      "PRINTING",
      "QUEUE_SLOT_ACTIVE",
      "RECRUITMENT",
      "REFERRAL",
      "REMINDER",
      "TRAINING",
    ]), // notification::Type
  })
  .extend({
    // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // notification::SystemNotification
    source: z.string(), // std::str
  });

export const UpdateSystemNotificationSchema = z
  .object({
    // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: zt.zonedDateTime().optional(), // std::datetime
    priority: z.int().min(-32768).max(32767).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum([
      "ADMIN",
      "ADVERT",
      "ANNOUNCEMENT",
      "EVENT",
      "HEALTH_AND_SAFETY",
      "INFRACTION",
      "PRINTING",
      "QUEUE_SLOT_ACTIVE",
      "RECRUITMENT",
      "REFERRAL",
      "REMINDER",
      "TRAINING",
    ]), // notification::Type
  })
  .extend({
    // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({
    // default::CreatedAt
  })
  .extend({
    // notification::SystemNotification
    source: z.string(), // std::str
  });
// #endregion
