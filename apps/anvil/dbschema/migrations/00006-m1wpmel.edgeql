CREATE MIGRATION m1wpmelevlyq3zc42tphwqqtisuxdr4vycopygicqcgfmmklkbxdqq
    ONTO m1y4syzxau4bu5bf5wwyljia5yk7mko5zols7njg4cy7vrgmhbbuiq
{
  ALTER TYPE notification::Announcement {
      DROP LINK views;
  };
  ALTER TYPE notification::Announcement {
      DROP PROPERTY content;
  };
  ALTER TYPE notification::Announcement {
      DROP PROPERTY title;
  };
  ALTER TYPE notification::Announcement RENAME TO users::UserNotification;
  CREATE SCALAR TYPE notification::NotificationTargetTypes EXTENDING enum<INDIVIDUAL, ALL, REPS, TEAM, MAILING_LIST>;
  CREATE TYPE notification::NotificationTarget {
      CREATE LINK target_mailing_list: notification::MailingList {
          CREATE ANNOTATION std::description := 'If the target_type is set to MAILING_LIST then this will be set otherwise its null';
      };
      CREATE LINK target_team: team::Team {
          CREATE ANNOTATION std::description := 'If the target_type is set to TEAM then this will be set otherwise its null';
      };
      CREATE LINK target_user: users::User {
          CREATE ANNOTATION std::description := 'If the target_type is set to INDIVIDUAL then this will be set otherwise its null';
      };
      CREATE REQUIRED PROPERTY target_type: notification::NotificationTargetTypes;
  };
  ALTER TYPE notification::Notification {
      CREATE REQUIRED LINK target: notification::NotificationTarget {
          SET REQUIRED USING (<notification::NotificationTarget>{});
          CREATE ANNOTATION std::description := 'Who will be receiving the notification and will have their own corresponding UserNotification Referencing it';
      };
      DROP LINK users;
  };
  ALTER TYPE notification::Notification {
      CREATE REQUIRED PROPERTY delivery_method: notification::DeliveryMethod {
          SET REQUIRED USING (<notification::DeliveryMethod>{});
      };
  };
  CREATE SCALAR TYPE notification::NotificationStatus EXTENDING enum<DRAFT, REVIEW, QUEUED, SENDING, SENT, ERRORED>;
  ALTER TYPE notification::Notification {
      CREATE REQUIRED PROPERTY status: notification::NotificationStatus {
          SET REQUIRED USING (<notification::NotificationStatus>{});
      };
      EXTENDING default::Auditable LAST;
      ALTER PROPERTY content {
          RESET OPTIONALITY;
          CREATE ANNOTATION std::description := 'The content line of the rendered notification (web) or the body of the rendered email';
      };
      CREATE PROPERTY dispatched_on: std::datetime {
          CREATE ANNOTATION std::description := 'When the notification started rolling out';
      };
      CREATE REQUIRED PROPERTY priority: std::int16 {
          SET default := 0;
          CREATE ANNOTATION std::description := 'The priority of the notification, defaults to zero. If there are two notifications trying to be used at the same time the higher priority one will take over. Otherwise the newer one prevails.';
      };
      CREATE PROPERTY title: std::str {
          CREATE ANNOTATION std::description := 'The Heading of the rendered notification (web) or the subject of the rendered email';
      };
  };
  CREATE TYPE notification::AuthoredNotification EXTENDING notification::Notification {
      CREATE LINK approved_by: users::Rep;
      CREATE LINK author: users::User;
      CREATE PROPERTY approved_on: std::datetime;
      CREATE PROPERTY scheduled_on: std::datetime {
          CREATE ANNOTATION std::description := 'When the notification will start rolling out';
      };
  };
  CREATE TYPE notification::SystemNotification EXTENDING notification::Notification {
      CREATE PROPERTY source: std::str {
          CREATE ANNOTATION std::description := 'The name of the service / module which caused this notification';
      };
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK notifications: users::UserNotification;
  };
  ALTER TYPE users::UserNotification {
      CREATE REQUIRED LINK notification: notification::Notification {
          SET REQUIRED USING (<notification::Notification>{});
      };
      CREATE REQUIRED LINK user: users::User {
          SET REQUIRED USING (<users::User>{});
      };
      CREATE REQUIRED PROPERTY is_acknowledged: std::bool {
          SET default := false;
          CREATE ANNOTATION std::description := 'Whether the user has dismissed / marked as read / interacted with it (will be true if noti type is email & is delivered)';
      };
  };
  ALTER SCALAR TYPE notification::DeliveryMethod EXTENDING enum<BANNER, EMAIL, TRAY, POPUP, DISCORD>;
  ALTER SCALAR TYPE notification::NotificationType EXTENDING enum<GENERAL, REFERRAL_SUCCESS, NEW_ANNOUNCEMENT, QUEUE_SLOT_ACTIVE, HEALTH_AND_SAFETY, REMINDER, INFRACTION, ADMIN, EVENT, ADVERT, TRAINING>;
};
