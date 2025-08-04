CREATE MIGRATION m1ooaa7sp2iurcu2t2g3rpix56mbjxhily3ugqmjz7463ace3zte3a
    ONTO m1vxygf5dc6sk5apu2ycahhff6pmvtmy6f4ah63fhxdgh2utfcnd2q
{
  ALTER TYPE event::Event {
      ALTER LINK attendees {
          ON TARGET DELETE ALLOW;
      };
      ALTER LINK interested {
          ON TARGET DELETE ALLOW;
      };
  };
  ALTER TYPE notification::Notification {
      ALTER LINK target {
          ON TARGET DELETE ALLOW;
      };
  };
  ALTER TYPE sign_in::QueuePlace {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE sign_in::SignIn {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE sign_in::UserRegistration {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE tools::Booking {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE training::Session {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
