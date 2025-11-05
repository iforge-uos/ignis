CREATE MIGRATION m1ghznmz7p545pvf5lqsco6kfg22hvjemfqsywb2vcu5v6sixpvkla
    ONTO m1apc6h5yh6f5yudkmvldt4d6zlyxawolzz7w5br4i2loed37przia
{
  ALTER ABSTRACT LINK default::timed {
      ALTER PROPERTY created_at {
          SET REQUIRED USING (std::datetime_of_statement());
      };
  };
  CREATE TYPE ai_rep::Question {
      CREATE REQUIRED PROPERTY rep_only: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY title: std::str;
      CREATE INDEX ON (.title) EXCEPT (.rep_only);
      CREATE REQUIRED PROPERTY answer: std::str;
      CREATE DEFERRED INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON (((.title ++ ' ') ++ .answer));
  };
  ALTER TYPE users::User {
      ALTER LINK agreements_signed {
          ALTER PROPERTY created_at {
              SET REQUIRED USING (std::datetime_of_statement());
          };
      };
  };
  CREATE TYPE tools::Booking EXTENDING default::Auditable {
      CREATE REQUIRED LINK user: users::User {
          ON TARGET DELETE DELETE SOURCE;
      };
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
  CREATE TYPE shop::Purchase EXTENDING default::CreatedAt {
      CREATE REQUIRED LINK user: users::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE PROPERTY collected_at: std::datetime {
          SET default := (std::datetime_of_statement());
          CREATE ANNOTATION std::description := 'Whether the order has been collected';
      };
      CREATE REQUIRED PROPERTY reverted: std::bool {
          SET default := false;
      };
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK purchases := (.<user[IS shop::Purchase]);
      ALTER LINK training {
          ALTER PROPERTY created_at {
              SET REQUIRED USING (std::datetime_of_statement());
          };
      };
      CREATE ACCESS POLICY rep_or_higher
          ALLOW ALL USING (EXISTS (({'Rep', 'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := "Only reps can see everyone's profile";
          };
      CREATE ACCESS POLICY view_self
          ALLOW ALL USING ((GLOBAL default::user ?= __subject__)) {
              SET errmessage := 'Can only view your own profile';
          };
  };
  ALTER TYPE event::Event {
      ALTER PROPERTY description {
          SET REQUIRED USING (<std::str>{});
      };
  };
  ALTER TYPE event::Event {
      ALTER PROPERTY title {
          RENAME TO name;
      };
      CREATE INDEX std::fts::index ON ((std::fts::with_options(.name, language := std::fts::Language.eng, weight_category := std::fts::Weight.A), std::fts::with_options(.description, language := std::fts::Language.eng, weight_category := std::fts::Weight.B)));
  };
  ALTER TYPE event::Event {
      ALTER LINK attendees {
          ALTER PROPERTY registered_at {
              RENAME TO created_at;
          };
      };
  };
  ALTER TYPE event::Event {
      ALTER LINK attendees {
          ON TARGET DELETE ALLOW;
          ALTER PROPERTY created_at {
              SET REQUIRED USING (std::datetime_of_statement());
          };
          RESET OPTIONALITY;
      };
      CREATE MULTI LINK interested: users::User {
          ON TARGET DELETE ALLOW;
          CREATE REQUIRED PROPERTY created_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
      };
      ALTER LINK organiser {
          SET MULTI;
      };
  };
  ALTER TYPE notification::Notification {
      DROP LINK target;
  };
  ALTER TYPE notification::AllTarget {
      DROP PROPERTY target;
  };
  ALTER TYPE notification::AllTarget RENAME TO notification::AllReps;
  CREATE TYPE notification::AllUsers {
      CREATE REQUIRED PROPERTY MAGIC: std::int16 {
          SET default := 0;
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE notification::Notification {
      CREATE REQUIRED MULTI LINK targets: (((((team::Team | notification::MailingList) | notification::AllReps) | users::User) | notification::AllUsers) | event::Event) {
          ON TARGET DELETE ALLOW;
          SET REQUIRED USING (<(((((event::Event | notification::AllReps) | notification::AllUsers) | notification::MailingList) | team::Team) | users::User)>{});
          CREATE ANNOTATION std::description := 'Who will be receiving the notification';
      };
  };
  ALTER TYPE notification::AllReps {
      CREATE REQUIRED PROPERTY MAGIC: std::int16 {
          SET default := 0;
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE notification::Notification {
      ALTER PROPERTY delivery_method {
          RENAME TO delivery_methods;
      };
      ALTER PROPERTY dispatched_at {
          RESET default;
          RESET OPTIONALITY;
      };
      ALTER PROPERTY priority {
          SET default := 2;
          CREATE CONSTRAINT std::max_value(3);
          CREATE CONSTRAINT std::min_value(1);
      };
  };
  ALTER TYPE notification::MailingList {
      CREATE INDEX std::fts::index ON ((std::fts::with_options(.name, language := std::fts::Language.eng, weight_category := std::fts::Weight.A), std::fts::with_options(.description, language := std::fts::Language.eng, weight_category := std::fts::Weight.B)));
  };
  CREATE ABSTRACT TYPE printing::PrinterStatus;
  CREATE ABSTRACT TYPE printing::AuditEntry EXTENDING default::CreatedAt {
      CREATE REQUIRED LINK status: (printing::PrinterStatus | printing::PrintStatus);
  };
  CREATE TYPE printing::Printer {
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED LINK status: printing::PrinterStatus;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY remote_ip: std::str;
      CREATE REQUIRED MULTI PROPERTY type: printing::Type;
  };
  ALTER TYPE printing::AuditEntry {
      CREATE REQUIRED LINK printer: printing::Printer;
      CREATE INDEX ON ((.printer, .status));
  };
  CREATE TYPE printing::PrinterAuditEntry EXTENDING printing::AuditEntry {
      ALTER LINK status {
          SET OWNED;
          SET REQUIRED;
          SET TYPE printing::PrinterStatus USING (<printing::PrinterStatus>{});
      };
  };
  CREATE TYPE printing::PrintAuditEntry EXTENDING printing::AuditEntry {
      ALTER LINK status {
          SET OWNED;
          SET REQUIRED;
          SET TYPE printing::PrintStatus USING (<printing::PrintStatus>{});
      };
      CREATE REQUIRED LINK print: printing::Print;
  };
  CREATE TYPE printing::PrintHistory EXTENDING default::CreatedAt {
      CREATE REQUIRED LINK printer: printing::Printer;
      CREATE REQUIRED LINK status: printing::PrintStatus;
      CREATE INDEX ON (.printer);
  };
  ALTER TYPE printing::Print {
      CREATE MULTI LINK `on`: printing::PrintHistory;
  };
  ALTER TYPE printing::Printer {
      CREATE MULTI LINK prints := (SELECT
          printing::Print
      FILTER
          (__source__ IN .`on`.printer)
      );
  };
  ALTER TYPE printing::PrintHistory {
      CREATE TRIGGER log_insert
          AFTER INSERT 
          FOR EACH DO (WITH
              print := 
                  __new__.<`on`[IS printing::Print]
          INSERT
              printing::PrintAuditEntry
              {
                  printer := __new__.printer,
                  status := __new__.status,
                  print := std::assert_single(std::assert_exists(print, message := 'PrintHistory was not created as a sub-insert'))
              });
      CREATE TRIGGER log_update
          AFTER UPDATE 
          FOR EACH DO (WITH
              print := 
                  __new__.<`on`[IS printing::Print]
          INSERT
              printing::PrintAuditEntry
              {
                  printer := __new__.printer,
                  status := __new__.status,
                  print := std::assert_single(std::assert_exists(print))
              });
  };
  CREATE TYPE printing::printer_status::Disabled EXTENDING printing::PrinterStatus;
  CREATE TYPE printing::printer_status::Disconnected EXTENDING printing::PrinterStatus;
  CREATE TYPE printing::printer_status::Failed EXTENDING printing::PrinterStatus {
      CREATE REQUIRED PROPERTY note: std::str;
      CREATE REQUIRED PROPERTY reason: printing::printer_status::FailureReason;
  };
  CREATE TYPE printing::printer_status::Idle EXTENDING printing::PrinterStatus;
  CREATE TYPE printing::printer_status::Printing EXTENDING printing::PrinterStatus {
      CREATE REQUIRED LINK print: printing::Print;
  };
  CREATE TYPE printing::print_status::Cancelled EXTENDING printing::PrintStatus;
  CREATE TYPE printing::print_status::Complete EXTENDING printing::PrintStatus;
  CREATE TYPE printing::print_status::Failed EXTENDING printing::PrintStatus {
      CREATE PROPERTY note: std::str;
      CREATE REQUIRED PROPERTY reason: printing::print_status::FailureReason;
  };
  CREATE TYPE printing::print_status::Printing EXTENDING printing::PrintStatus {
      CREATE REQUIRED LINK print: printing::Print;
  };
  CREATE TYPE printing::print_status::Queued EXTENDING printing::PrintStatus;
  CREATE TYPE shop::Item {
      CREATE REQUIRED PROPERTY icon_url: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY supplier: std::str;
      CREATE REQUIRED PROPERTY supplier_url: std::str;
  };
  CREATE TYPE shop::Skew EXTENDING default::Auditable {
      CREATE REQUIRED LINK item: shop::Item;
      CREATE REQUIRED LINK dimensions: shop::Dimension;
      CREATE PROPERTY colour: std::str;
      CREATE PROPERTY count: std::int16;
      CREATE PROPERTY icon_url: std::str {
          CREATE ANNOTATION std::description := 'For the different colours if needed';
      };
      CREATE REQUIRED PROPERTY price: std::int64 {
          CREATE ANNOTATION std::description := 'Price in pence, cause using floats is silly *cough* *cough* EMOS';
      };
      CREATE REQUIRED PROPERTY till_id: std::int16 {
          CREATE ANNOTATION std::description := 'The PLU ID in EMOS';
      };
  };
  ALTER TYPE shop::Item {
      CREATE MULTI LINK skews := (.<item[IS shop::Skew]);
  };
  CREATE TYPE shop::LineItem {
      CREATE REQUIRED LINK skew: shop::Skew;
      CREATE REQUIRED PROPERTY price: std::int64 {
          CREATE ANNOTATION std::description := 'Price at time of sale';
      };
  };
  ALTER TYPE shop::Purchase {
      CREATE REQUIRED MULTI LINK items: shop::LineItem {
          SET REQUIRED USING (<shop::LineItem>{});
      };
  };
  CREATE TYPE shop::`Module` {
      CREATE MULTI LINK users: users::User;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE shop::Purchase {
      CREATE LINK `module`: shop::`Module`;
  };
  ALTER TYPE shop::`Module` {
      CREATE MULTI LINK purchases := (.<`module`[IS shop::Purchase]);
      CREATE REQUIRED PROPERTY total := (std::sum(.purchases.items.price));
  };
  CREATE TYPE shop::dimensions::Cuboid EXTENDING shop::Dimension {
      CREATE REQUIRED PROPERTY height: std::int64;
      CREATE REQUIRED PROPERTY length: std::int64;
      CREATE REQUIRED PROPERTY unit := ('mm');
      CREATE REQUIRED PROPERTY width: std::int64;
      CREATE REQUIRED PROPERTY formatted := ('\(.length) x \(.width) x \(.height)\(.unit)');
  };
  CREATE TYPE shop::dimensions::Cylindrical EXTENDING shop::Dimension {
      CREATE REQUIRED PROPERTY diameter: std::int64;
      CREATE REQUIRED PROPERTY length: std::int64;
      CREATE REQUIRED PROPERTY unit := ('mm');
      CREATE REQUIRED PROPERTY formatted := ('\(.diameter)ø x \(.length)\(.unit)');
  };
  CREATE TYPE shop::dimensions::ISO216 EXTENDING shop::Dimension {
      CREATE REQUIRED PROPERTY size: std::int16;
      CREATE REQUIRED PROPERTY unit := ('A');
      CREATE REQUIRED PROPERTY formatted := ('\(.unit)\(.size)');
  };
  CREATE TYPE shop::dimensions::LiquidVolume EXTENDING shop::Dimension {
      CREATE REQUIRED PROPERTY unit := ('L');
      CREATE REQUIRED PROPERTY volume: std::int64;
      CREATE REQUIRED PROPERTY formatted := ('\(.volume)\(.unit)');
  };
  CREATE TYPE shop::dimensions::Mass EXTENDING shop::Dimension {
      CREATE REQUIRED PROPERTY mass: std::int64;
      CREATE REQUIRED PROPERTY unit := ('kg');
      CREATE REQUIRED PROPERTY formatted := ('\(.mass)\(.unit)');
  };
  ALTER TYPE sign_in::Location {
      ALTER LINK off_shift_reps {
          USING (WITH
              rep_sign_ins := 
                  (SELECT
                      .sign_ins
                  FILTER
                      (.reason.name != 'Rep On Shift')
                  )
          SELECT
              rep_sign_ins.user[IS users::Rep]
          );
      };
      ALTER LINK on_shift_reps {
          USING (WITH
              rep_sign_ins := 
                  (SELECT
                      .sign_ins
                  FILTER
                      (.reason.name = 'Rep On Shift')
                  )
          SELECT
              rep_sign_ins.user[IS users::Rep]
          );
      };
      ALTER LINK queued {
          USING (SELECT
              .<location[IS sign_in::QueuePlace]
          FILTER
              (.ends_at < std::datetime_of_statement())
          );
      };
  };
  ALTER TYPE sign_in::Location {
      ALTER PROPERTY in_of_hours_rep_multiplier {
          RENAME TO in_hours_rep_multiplier;
      };
      ALTER PROPERTY max_count {
          USING (WITH
              multiplier := 
                  (.out_of_hours_rep_multiplier IF .out_of_hours ELSE .in_hours_rep_multiplier)
          SELECT
              std::min({((multiplier * std::count(.supervising_reps)) + (std::count(.off_shift_reps) IF NOT (.out_of_hours) ELSE 0)), .max_users})
          );
      };
  };
  ALTER TYPE sign_in::Location {
      CREATE REQUIRED PROPERTY available_capacity := (SELECT
          ((.max_count - std::count(.sign_ins)) - std::count(.queued_users_that_can_sign_in))
      );
      ALTER PROPERTY can_sign_in {
          USING ((std::count(.sign_ins) < .max_count));
      };
  };
  ALTER TYPE team::Team {
      DROP PROPERTY tag;
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
      CREATE REQUIRED MULTI LINK rep: training::Training {
          CREATE ANNOTATION std::description := 'The associated training that reps should have to supervise this. Empty if the training is for reps.';
      };
      CREATE TRIGGER check_rep
          AFTER UPDATE, INSERT 
          FOR EACH DO (std::assert(NOT (EXISTS (__new__.rep.rep)), message := "Tool's rep training isn't rep training?"));
      CREATE REQUIRED MULTI LINK training: training::Training {
          CREATE ANNOTATION std::description := 'The training required to unlock this tool';
      };
      CREATE REQUIRED PROPERTY borrowable: std::bool;
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE PROPERTY max_booking_daily: std::duration;
      CREATE PROPERTY max_booking_weekly: std::duration;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY quantity: std::int16;
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
  ALTER TYPE training::Answer {
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
      CREATE ACCESS POLICY h_and_s_or_higher
          ALLOW ALL USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              ((EXISTS (({'Admin'} INTERSECT user.roles.name)) OR ((user IS users::Rep) AND EXISTS (({'H&S'} INTERSECT user[IS users::Rep].teams.name)))) ?? false)
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
  };
  ALTER TYPE users::Infraction {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update infractions';
          };
  };
  ALTER TYPE users::Integration {
      DROP INDEX ON ((.platform, .external_id));
      DROP INDEX ON ((.platform, .user));
  };
  ALTER TYPE users::User {
      DROP LINK referrals;
      ALTER PROPERTY ucard_number {
          CREATE ANNOTATION std::description := "The user's UCard number without the issue number (first 3 digits)";
      };
  };
  DROP SCALAR TYPE notification::AllTargetTarget;
  DROP SCALAR TYPE training::Selectability;
};
