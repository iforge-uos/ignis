CREATE MIGRATION m1gkcw4hvmqv4dzrhvjyjouk6aiss2bq7t5gkng3kskxiznf3ilh5q
    ONTO m1kwcsnqorn2hbgbzhcesr5dlgx42bcoirycrmjwgrpeozamx3tcsq
{
  CREATE MODULE notification IF NOT EXISTS;
  CREATE SCALAR TYPE notification::DeliveryMethod EXTENDING enum<BANNER, EMAIL, TRAY, POPUP>;
  CREATE SCALAR TYPE notification::Status EXTENDING enum<DRAFT, REVIEW, QUEUED, SENDING, SENT, ERRORED>;
  CREATE SCALAR TYPE notification::Type EXTENDING enum<GENERAL, REFERRAL_SUCCESS, NEW_ANNOUNCEMENT, QUEUE_SLOT_ACTIVE, HEALTH_AND_SAFETY, REMINDER, INFRACTION, ADMIN, EVENT, ADVERT, TRAINING, PRINTING, RECRUITMENT>;
  CREATE TYPE notification::Notification EXTENDING default::Auditable {
      CREATE REQUIRED PROPERTY content: std::str {
          CREATE ANNOTATION std::description := 'The content (MARKDOWN) from plate';
      };
      CREATE REQUIRED MULTI PROPERTY delivery_method: notification::DeliveryMethod;
      CREATE REQUIRED PROPERTY dispatched_at: std::datetime {
          SET default := (std::datetime_of_statement());
          CREATE ANNOTATION std::description := "When the notification started rolling out or if it's scheduled when it will be dispatched.";
      };
      CREATE REQUIRED PROPERTY priority: std::int16 {
          SET default := 0;
          CREATE ANNOTATION std::description := 'The priority of the notification, defaults to zero. The higher the number the higher the priority. If there are two notifications trying to be used at the same time the higher priority one will take over. Otherwise the newer one prevails.';
      };
      CREATE REQUIRED PROPERTY status: notification::Status;
      CREATE REQUIRED PROPERTY title: std::str {
          CREATE ANNOTATION std::description := 'The heading of the rendered notification (web) or the subject of the rendered email';
      };
      CREATE REQUIRED PROPERTY type: notification::Type;
  };
  CREATE TYPE notification::AuthoredNotification EXTENDING notification::Notification {
      CREATE LINK approved_by: users::Rep;
      CREATE REQUIRED LINK author: users::User;
      CREATE PROPERTY approved_on: std::datetime;
  };
  CREATE SCALAR TYPE notification::TargetTypes EXTENDING enum<ALL, USER, REPS, TEAM, MAILING_LIST>;
  CREATE TYPE notification::Target {
      CREATE LINK target_team: team::Team {
          CREATE ANNOTATION std::description := 'If the target_type is set to TEAM then this will be set otherwise its null';
      };
      CREATE LINK target_user: users::User {
          CREATE ANNOTATION std::description := 'If the target_type is set to USER then this will be set otherwise its null';
      };
      CREATE REQUIRED PROPERTY target_type: notification::TargetTypes;
  };
  ALTER TYPE notification::Notification {
      CREATE REQUIRED LINK target: notification::Target {
          CREATE ANNOTATION std::description := 'Who will be receiving the notification';
      };
  };
  CREATE TYPE notification::MailingList EXTENDING default::Auditable {
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK mailing_list_subscriptions: notification::MailingList;
      CREATE MULTI LINK notifications: notification::Notification {
          CREATE PROPERTY acknowledged: std::datetime {
              CREATE ANNOTATION std::description := 'Time the user has dismissed / marked as read / interacted with it (will be true if noti type is email & is delivered) otherwise empty';
          };
      };
  };
  ALTER TYPE notification::MailingList {
      CREATE MULTI LINK subscribers := (.<mailing_list_subscriptions[IS users::User]);
  };
  ALTER TYPE notification::Target {
      CREATE LINK target_mailing_list: notification::MailingList {
          CREATE ANNOTATION std::description := 'If the target_type is set to MAILING_LIST then this will be set otherwise its null';
      };
  };
  CREATE TYPE notification::SystemNotification EXTENDING notification::Notification {
      CREATE REQUIRED PROPERTY source: std::str {
          CREATE ANNOTATION std::description := 'The name of the service / module which caused this notification';
      };
  };
};
