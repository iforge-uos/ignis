CREATE MIGRATION m1fwkll4kzxolh55t4miymnu7vp5e5msssp3abri72ihpn7v64huaq
    ONTO m1bqipkajc4hd4rugp562jjblfmkc63rscwkhieviyjkr6omhbau2a
{
  CREATE MODULE tools IF NOT EXISTS;
  ALTER SCALAR TYPE event::EventType RENAME TO event::Type;
  CREATE SCALAR TYPE team::Name EXTENDING enum<IT, `3DP`, Hardware, Publicity, Events, Relations, Operations, `Recruitment & Development`, `Health & Safety`, Inclusions, `Unsorted Reps`, `Future Reps`, Staff>;
  CREATE SCALAR TYPE tools::Status EXTENDING enum<NOMINAL, IN_USE, OUT_OF_ORDER>;
  CREATE TYPE tools::Booking EXTENDING default::Auditable {
      CREATE REQUIRED LINK user: users::User;
      CREATE REQUIRED PROPERTY ends_at: std::datetime;
      CREATE REQUIRED PROPERTY starts_at: std::datetime;
      CREATE REQUIRED PROPERTY duration := ((.ends_at - .starts_at));
      CREATE PROPERTY cancelled: std::bool {
          CREATE ANNOTATION std::description := '\n                Tribool, empty for honoured (signed in and selected as reason), true if cancelled through Google (if this is possible) or UI, false if not honoured\n            ';
      };
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK bookings := (.<user[IS tools::Booking]);
  };
  ALTER TYPE event::Event {
      ALTER LINK attendees {
          RESET OPTIONALITY;
      };
      CREATE MULTI LINK interested: users::User {
          CREATE PROPERTY registered_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
      };
      ALTER LINK organiser {
          SET MULTI;
      };
      ALTER PROPERTY description {
          SET REQUIRED USING (<std::str>{});
      };
  };
  ALTER TYPE sign_in::Location {
      ALTER LINK queued {
          USING (SELECT
              .<location[IS sign_in::QueuePlace]
          FILTER
              (.ends_at < std::datetime_of_statement())
          );
      };
  };
  ALTER TYPE sign_in::Reason {
      DROP INDEX ON (.name);
  };
  CREATE TYPE tools::Tool {
      CREATE REQUIRED PROPERTY is_bookable: std::bool;
      CREATE REQUIRED PROPERTY status: tools::Status;
      CREATE PROPERTY min_booking_time: std::duration {
          SET default := (SELECT
              (<std::duration>'1h' IF .is_bookable ELSE {})
          );
      };
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED MULTI LINK training: training::Training;
      CREATE PROPERTY max_booking_daily: std::duration;
      CREATE PROPERTY max_booking_weekly: std::duration;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE tools::Booking {
      CREATE REQUIRED LINK tool: tools::Tool {
          SET REQUIRED USING (<tools::Tool>{});
      };
      CREATE ACCESS POLICY is_bookable
          ALLOW UPDATE, INSERT USING ((.tool.is_bookable AND (.tool.status != tools::Status.OUT_OF_ORDER))) {
              SET errmessage := 'This tool is not currently bookable';
          };
  };
  ALTER TYPE tools::Tool {
      CREATE MULTI LINK bookings := (.<tool[IS tools::Booking]);
  };
  ALTER TYPE tools::Booking {
      CREATE ACCESS POLICY isnt_overlapping
          ALLOW UPDATE, INSERT USING (((.starts_at < .ends_at) AND NOT (EXISTS ((SELECT
              .tool.bookings
          FILTER
              (((.starts_at <= __subject__.starts_at) AND (__subject__.starts_at <= .ends_at)) OR ((.starts_at <= __subject__.ends_at) AND (__subject__.ends_at <= .ends_at)))
          ))))) {
              SET errmessage := 'Booking overlaps with another booking';
          };
      CREATE ACCESS POLICY too_short
          ALLOW UPDATE, INSERT USING ((.tool.is_bookable AND (.duration >= (.tool.min_booking_time ?? <std::duration>'PT1h')))) {
              SET errmessage := 'Booking is too short, must be at least nnn minutes';
          };
  };
  ALTER TYPE users::User {
      DROP LINK referrals;
  };
};
