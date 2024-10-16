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
    >;

    scalar type DeliveryMethod extending enum<
        IN_APP,
        EMAIL,
    >;

    type Notification {
        required type: NotificationType;
        required content: str;
        multi users: users::User {
            read: bool {
                default := false
            }
            # multi delivery_method: DeliveryMethod {  # TODO
            #     default := select ...
            # }
        }
    }

    type Announcement extending default::Auditable {
        required title: str;
        required content: str;
        multi views: users::User {
            viewed_at: datetime {
                readonly := true;
                default := datetime_of_statement();
            }
        }
    }
}