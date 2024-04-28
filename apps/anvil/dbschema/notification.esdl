module notification {
    type MailingList extending default::Auditable {
        required name: str;
        required description: str;
        multi link subscribers := .<mailing_list_subscriptions [is users::User];
    }

    scalar type NotificationType extending enum<
        GENERAL,
        REFERRAL_SUCCESS,
        NEW_ANNOUNCEMENT,
        QUEUE_SLOT_ACTIVE,
        HEALTH_AND_SAFETY,
        REMINDER,
        INFRACTION,
        ADMIN,
        EVENT,
        ADVERT,
        TRAINING
    >;

    scalar type DeliveryMethod extending enum<
        BANNER,
        EMAIL,
        TRAY,
        POPUP
    >;

    scalar type NotificationStatus extending enum<
        DRAFT,
        REVIEW,
        QUEUED,
        SENDING,
        SENT,
        ERRORED
    >;

    scalar type NotificationTargetTypes extending enum<
        INDIVIDUAL,
        ALL,
        REPS,
        TEAM,
        MAILING_LIST
    >;

    type NotificationTarget {
        required target_type: NotificationTargetTypes;
        target_mailing_list: MailingList {
            annotation description := "If the target_type is set to MAILING_LIST then this will be set otherwise its null"
        }
        target_user: users::User {
            annotation description := "If the target_type is set to INDIVIDUAL then this will be set otherwise its null"
        }
        target_team: team::Team {
            annotation description := "If the target_type is set to TEAM then this will be set otherwise its null"
        }
    }

    type Notification extending default::Auditable {
        required delivery_method: DeliveryMethod;
        required type: NotificationType;
        required status: NotificationStatus;
        required priority: int16 {
            annotation description := "The priority of the notification, defaults to zero. If there are two notifications trying to be used at the same time the higher priority one will take over. Otherwise the newer one prevails.";
            default := 0;
        }
        dispatched_on: datetime {
            annotation description := "When the notification started rolling out"
        }
        title: str {
            annotation description := "The Heading of the rendered notification (web) or the subject of the rendered email"
        }
        content: str {
            annotation description := "The content line of the rendered notification (web) or the body of the rendered email"
        }
        required target: NotificationTarget {
            annotation description := "Who will be receiving the notification and will have their own corresponding UserNotification Referencing it"
        }
    }

    type SystemNotification extending Notification {
        source: str {
            annotation description := "The name of the service / module which caused this notification"
        }
    }

    type AuthoredNotification extending Notification {
        author: users::User;
        approved_by: users::Rep;
        approved_on: datetime;
        scheduled_on: datetime {
            annotation description := "When the notification will start rolling out"
        }
    }
}