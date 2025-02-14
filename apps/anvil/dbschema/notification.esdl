module notification {
    type MailingList extending default::Auditable {
        required name: str;
        required description: str;
        multi link subscribers := .<mailing_list_subscriptions[is users::User];
    }

    scalar type Type extending enum<
        ADMIN,
        ADVERT,
        ANNOUNCEMENT,
        EVENT,
        HEALTH_AND_SAFETY,
        INFRACTION,
        PRINTING,
        QUEUE_SLOT_ACTIVE,
        RECRUITMENT,
        REFERRAL,
        REMINDER,
        TRAINING,
    >;

    scalar type DeliveryMethod extending enum<
        BANNER,
        EMAIL,
        TRAY,
        POPUP,
        DISCORD,
    >;

    scalar type Status extending enum<
        DRAFT,
        REVIEW,
        QUEUED,
        SENDING,
        SENT,
        ERRORED,
    >;

    # to avoid linking to every user we have a silly lil sorta enum (regular enums don't work)
    scalar type AllTargetTarget extending enum<
        ALL,
        REPS,
    >;

    type AllTarget {
        required target: AllTargetTarget;
    }

    type Notification extending default::Auditable {
        required multi delivery_method: DeliveryMethod;
        required type: Type;
        required status: Status;
        required priority: int16 {
            annotation description := $$
                The priority of the notification, defaults to zero. The higher the number the higher the priority. If
                there are two notifications trying to be used at the same time the higher priority one will take over.
                Otherwise the newer one prevails
            $$;
            default := 0;
        }
        required dispatched_at: datetime {
            annotation description := "When the notification started rolling out or if it's scheduled when it will be dispatched";
            default := datetime_of_statement();
        }
        required title: str {
            annotation description := "The heading of the rendered notification (web) or the subject of the rendered email"
        }
        required content: str {
            annotation description := "The content (MARKDOWN) from plate"
        }
        required multi target: AllTarget | users::User | team::Team | MailingList | event::Event;
    }

    type SystemNotification extending Notification {
        required source: str {
            annotation description := "The name of the service / module which caused this notification"
        }
    }

    type AuthoredNotification extending Notification {
        required author: users::User;
        approved_by: users::Rep;
        approved_on: datetime;
    }
}