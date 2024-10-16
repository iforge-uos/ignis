import { z } from "zod";

// #region notification::NotificationType
export const NotificationTypeSchema = z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE"]);
// #endregion

// #region notification::Announcement
export const CreateAnnouncementSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // notification::Announcement
    content: z.string(), // std::str
    title: z.string(), // std::str
  });

export const UpdateAnnouncementSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // notification::Announcement
    content: z.string(), // std::str
    title: z.string(), // std::str
  });
// #endregion

// #region notification::MailingList
export const CreateMailingListSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // notification::MailingList
    description: z.string(), // std::str
    name: z.string(), // std::str
  });

export const UpdateMailingListSchema = z.
  object({ // default::Auditable
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/).optional(), // std::datetime
  })
  .extend({ // notification::MailingList
    description: z.string(), // std::str
    name: z.string(), // std::str
  });
// #endregion

// #region notification::Notification
export const CreateNotificationSchema = z.
  object({
    content: z.string(), // std::str
    type: z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE"]), // notification::NotificationType
  });

export const UpdateNotificationSchema = z.
  object({
    content: z.string(), // std::str
    type: z.enum(["GENERAL", "REFERRAL_SUCCESS", "NEW_ANNOUNCEMENT", "QUEUE_SLOT_ACTIVE"]), // notification::NotificationType
  });
// #endregion
