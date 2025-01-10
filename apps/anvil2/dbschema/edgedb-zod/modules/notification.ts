import { z } from "zod";

// #region notification::DeliveryMethod
export const DeliveryMethodSchema = z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]);
// #endregion

// #region notification::Status
export const StatusSchema = z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]);
// #endregion

// #region notification::TargetTypes
export const TargetTypesSchema = z.enum(["ALL", "USER", "REPS", "TEAM", "MAILING_LIST"]);
// #endregion

// #region notification::Type
export const TypeSchema = z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE", "HEALTH_AND_SAFETY", "REMINDER", "INFRACTION", "ADMIN", "EVENT", "ADVERT", "TRAINING", "PRINTING", "RECRUITMENT"]);
// #endregion

// #region notification::AuthoredNotification
export const CreateAuthoredNotificationSchema = z.
  object({ // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: z.date().optional(), // std::datetime
    priority: z.number().int().min(0).max(65535).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE", "HEALTH_AND_SAFETY", "REMINDER", "INFRACTION", "ADMIN", "EVENT", "ADVERT", "TRAINING", "PRINTING", "RECRUITMENT"]), // notification::Type
  })
  .extend({ // notification::AuthoredNotification
    approved_on: z.date().optional(), // std::datetime
  });

export const UpdateAuthoredNotificationSchema = z.
  object({ // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: z.date().optional(), // std::datetime
    priority: z.number().int().min(0).max(65535).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE", "HEALTH_AND_SAFETY", "REMINDER", "INFRACTION", "ADMIN", "EVENT", "ADVERT", "TRAINING", "PRINTING", "RECRUITMENT"]), // notification::Type
  })
  .extend({ // notification::AuthoredNotification
    approved_on: z.date().optional(), // std::datetime
  });
// #endregion

// #region notification::MailingList
export const CreateMailingListSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // notification::MailingList
    description: z.string(), // std::str
    name: z.string(), // std::str
  });

export const UpdateMailingListSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // notification::MailingList
    description: z.string(), // std::str
    name: z.string(), // std::str
  });
// #endregion

// #region notification::Notification
export const CreateNotificationSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: z.date().optional(), // std::datetime
    priority: z.number().int().min(0).max(65535).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE", "HEALTH_AND_SAFETY", "REMINDER", "INFRACTION", "ADMIN", "EVENT", "ADVERT", "TRAINING", "PRINTING", "RECRUITMENT"]), // notification::Type
  });

export const UpdateNotificationSchema = z.
  object({ // default::Auditable
    updated_at: z.date().optional(), // std::datetime
  })
  .extend({ // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: z.date().optional(), // std::datetime
    priority: z.number().int().min(0).max(65535).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE", "HEALTH_AND_SAFETY", "REMINDER", "INFRACTION", "ADMIN", "EVENT", "ADVERT", "TRAINING", "PRINTING", "RECRUITMENT"]), // notification::Type
  });
// #endregion

// #region notification::SystemNotification
export const CreateSystemNotificationSchema = z.
  object({ // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: z.date().optional(), // std::datetime
    priority: z.number().int().min(0).max(65535).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE", "HEALTH_AND_SAFETY", "REMINDER", "INFRACTION", "ADMIN", "EVENT", "ADVERT", "TRAINING", "PRINTING", "RECRUITMENT"]), // notification::Type
  })
  .extend({ // notification::SystemNotification
    source: z.string(), // std::str
  });

export const UpdateSystemNotificationSchema = z.
  object({ // notification::Notification
    content: z.string(), // std::str
    delivery_method: z.enum(["BANNER", "EMAIL", "TRAY", "POPUP", "DISCORD"]), // notification::DeliveryMethod
    dispatched_at: z.date().optional(), // std::datetime
    priority: z.number().int().min(0).max(65535).optional(), // std::int16
    status: z.enum(["DRAFT", "REVIEW", "QUEUED", "SENDING", "SENT", "ERRORED"]), // notification::Status
    title: z.string(), // std::str
    type: z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE", "HEALTH_AND_SAFETY", "REMINDER", "INFRACTION", "ADMIN", "EVENT", "ADVERT", "TRAINING", "PRINTING", "RECRUITMENT"]), // notification::Type
  })
  .extend({ // notification::SystemNotification
    source: z.string(), // std::str
  });
// #endregion

// #region notification::Target
export const CreateTargetSchema = z.
  object({
    target_type: z.enum(["ALL", "USER", "REPS", "TEAM", "MAILING_LIST"]), // notification::TargetTypes
  });

export const UpdateTargetSchema = z.
  object({
    target_type: z.enum(["ALL", "USER", "REPS", "TEAM", "MAILING_LIST"]), // notification::TargetTypes
  });
// #endregion
