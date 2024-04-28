CREATE MIGRATION m13qygwpcmc6ngqirgk6rec2az3y5wsfjaete5y3tsco5l4igey6pa
    ONTO m1i5sl747aqrdqjqvpam7jclntqtnymetitoe3qapogvvtbpdoppva
{
  CREATE TYPE users::UserNotification EXTENDING default::Auditable {
      CREATE REQUIRED LINK notification: notification::Notification;
      CREATE REQUIRED LINK user: users::User;
      CREATE REQUIRED PROPERTY is_acknowledged: std::bool {
          SET default := false;
          CREATE ANNOTATION std::description := 'Whether the user has dismissed / marked as read / interacted with it (will be true if noti type is email & is delivered)';
      };
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK notifications: users::UserNotification;
  };
};
