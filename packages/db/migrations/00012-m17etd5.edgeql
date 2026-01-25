CREATE MIGRATION m1ppns2llyruympbotb3vjalamvvelncxwh7ownas6v42xocdnvdna
    ONTO m1uuyy7z7l6xneaywt2jfgkfnxy6lxgpi3pgqjrplyymf3tgxr5hkq
{
  CREATE EXTENSION pgvector VERSION '0.7';
  CREATE EXTENSION ai VERSION '1.0';
  CREATE MODULE ai_rep IF NOT EXISTS;
  CREATE MODULE dimensions IF NOT EXISTS;
  CREATE MODULE printing IF NOT EXISTS;
  CREATE MODULE printing::print_status IF NOT EXISTS;
  CREATE MODULE printing::printer_status IF NOT EXISTS;
  CREATE MODULE shop IF NOT EXISTS;
  CREATE MODULE tools IF NOT EXISTS;
  ALTER SCALAR TYPE event::EventType RENAME TO event::Type;
  CREATE SCALAR TYPE printing::Type EXTENDING enum<PLA, TPU, PETG, RESIN>;
  CREATE SCALAR TYPE printing::print_status::FailureReason EXTENDING enum<NO_EXTRUSION_AT_PRINT_START, POOR_BED_ADHESION, UNDER_EXTRUSION, OVER_EXTRUSION, GAPS_IN_TOP_LAYERS, STRINGING_AND_OOZING, OVERHEATING, LAYER_SHIFTING, LAYER_SEPARATION_AND_SPLITTING, FILAMENT_GRINDING, EXTRUDER_CLOG, EXTRUSION_STOPS_MID_PRINT, WEAK_INFILL, BLOBS_AND_ZITS, GAPS_BETWEEN_INFILL_AND_PERIMETER, CORNER_CURLING_AND_ROUGHNESS, TOP_SURFACE_SCARRING, CORNER_GAPS_IN_BOTTOM_LAYER, LAYER_LINES_ON_SIDES, VIBRATION_AND_RINGING, THIN_WALL_GAPS, SMALL_FEATURE_LOSS, INCONSISTENT_EXTRUSION, WARPING, POOR_OVERHANG_QUALITY, DIMENSIONAL_INACCURACY, POOR_BRIDGING, FILAMENT_FEEDING, FILAMENT_RAN_OUT, NOT_A_CLUE>;
  CREATE SCALAR TYPE printing::printer_status::FailureReason EXTENDING enum<MAIN_CONTROLLER_BOARD, POWER_SUPPLY, DISPLAY_BOARD, WIFI_MODULE, HOTEND_THERMISTOR, HEATBED_THERMISTOR, HOTEND_HEATER_CARTRIDGE, HEATBED_HEATING_ELEMENT, HEATER_BLOCK, EXTRUDER_MOTOR, X_AXIS_MOTOR, Y_AXIS_MOTOR, Z_AXIS_MOTOR, LINEAR_RAILS, LINEAR_BEARINGS, BELT_SYSTEM, PULLEYS, LEAD_SCREW_NUT, HOTEND_FAN, PART_COOLING_FAN, CHAMBER_FAN, POWER_SUPPLY_FAN, NOZZLE, HEAT_BREAK, HEAT_SINK, EXTRUDER_GEARS, BOWDEN_TUBE, FILAMENT_SENSOR, BED_LEVELING_SENSOR, DOOR_SENSOR, CRASH_DETECTION_SENSOR, POWER_PANIC_SENSOR, PRINT_BED_SURFACE, BED_LEVELLING_SPRINGS, BED_MOUNTING_HARDWARE, HOTEND_WIRING, HEATBED_WIRING, MOTOR_WIRING, MAIN_POWER_CABLE, USB_CONNECTION, FRAME_COMPONENTS, SMOOTH_RODS, ENCLOSURE_PANELS, FILAMENT_FEEDING>;
  CREATE SCALAR TYPE shop::DimensionType EXTENDING std::json;
  CREATE SCALAR TYPE team::Name EXTENDING enum<IT, `3DP`, Hardware, Publicity, Events, Relations, Operations, `Recruitment & Development`, `Health & Safety`, Inclusions, Sustainability, `Unsorted Reps`, `Future Reps`, Staff>;
  CREATE SCALAR TYPE tools::Selectability EXTENDING enum<UNTRAINED, REVOKED, EXPIRED, IN_PERSON_MISSING, REPS_UNTRAINED, TOOL_BROKEN>;
  CREATE SCALAR TYPE tools::Status EXTENDING enum<NOMINAL, IN_USE, PARTIALLY_FUNCTIONAL, OUT_OF_ORDER>;
  CREATE SCALAR TYPE training::ExpiresReturn EXTENDING std::json;
  CREATE SCALAR TYPE training::NextStep EXTENDING enum<DO_ONLINE, DO_IN_PERSON, DO_IN_PERSON_OR_REP_ONLINE, DO_REP_ONLINE, DO_IN_PERSON_OR_REP_IN_PERSON, DO_REP_IN_PERSON, NONE>;
  CREATE SCALAR TYPE training::Status EXTENDING enum<UNTRAINED, REVOKED, EXPIRED, ONLINE_COMPLETE, FULLY_COMPLETE, REP_ONLINE_COMPLETE_NO_IN_PERSON, USER_TRAINING_COMPLETE, REP_ONLINE_COMPLETE>;
  CREATE SCALAR TYPE training::StatusReturn EXTENDING std::json;
  ALTER TYPE users::Rep {
      ALTER LINK teams {
          CREATE PROPERTY team_lead: array<tuple<created_at: std::datetime, ends_at: std::datetime>>;
      };
  };
  ALTER ABSTRACT LINK default::timed {
      ALTER PROPERTY created_at {
          SET REQUIRED USING (std::datetime_of_statement());
      };
  };
  CREATE FUNCTION default::bin(string: std::str) ->  std::int64 USING (SELECT
      std::sum((FOR idx_char_pair IN std::enumerate(std::array_unpack(std::str_split(std::str_reverse(std::str_replace(string, '_', '')), '')))
      UNION
          (WITH
              idx :=
                  idx_char_pair.0
              ,
              char :=
                  <std::int64>idx_char_pair.1
          SELECT
              std::bit_lshift(char, idx)
          )))
  );
  CREATE REQUIRED GLOBAL training::COLLAPSED_LOOKUPS := (SELECT
      (((((
          care := default::bin('0001'),
          value := default::bin('0001'),
          s := training::Status.REVOKED,
          n := training::NextStep.DO_ONLINE
      ) UNION (
          care := default::bin('0011'),
          value := default::bin('0010'),
          s := training::Status.EXPIRED,
          n := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('1011'),
          value := default::bin('0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      )) UNION (
          care := default::bin('1011'),
          value := default::bin('1000'),
          s := training::Status.ONLINE_COMPLETE,
          n := training::NextStep.DO_IN_PERSON
      )) UNION (
          care := default::bin('1111'),
          value := default::bin('1100'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      ))
  );
  CREATE REQUIRED GLOBAL training::LOOKUPS := (SELECT
      (((((((((((((((
          care := default::bin('0_0000_1000'),
          value := default::bin('0_0000_1000'),
          s := training::Status.REVOKED,
          n := training::NextStep.DO_ONLINE
      ) UNION (
          care := default::bin('0_0000_0010'),
          value := default::bin('0_0000_0010'),
          s := training::Status.REVOKED,
          n := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('0_0001_1010'),
          value := default::bin('0_0001_0010'),
          s := training::Status.EXPIRED,
          n := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('0_0000_1110'),
          value := default::bin('0_0000_1100'),
          s := training::Status.EXPIRED,
          n := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('1_0000_1111'),
          value := default::bin('0_0000_0000'),
          s := training::Status.ONLINE_COMPLETE,
          n := training::NextStep.DO_REP_ONLINE
      )) UNION (
          care := default::bin('1_0110_1111'),
          value := default::bin('1_0000_0000'),
          s := training::Status.ONLINE_COMPLETE,
          n := training::NextStep.DO_IN_PERSON_OR_REP_ONLINE
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1110_0000'),
          s := training::Status.USER_TRAINING_COMPLETE,
          n := training::NextStep.DO_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_0110_1111'),
          value := default::bin('1_0100_0000'),
          s := training::Status.USER_TRAINING_COMPLETE,
          n := training::NextStep.DO_REP_ONLINE
      )) UNION (
          care := default::bin('1_1011_1111'),
          value := default::bin('0_1010_0000'),
          s := training::Status.REP_ONLINE_COMPLETE,
          n := training::NextStep.DO_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1010_0000'),
          s := training::Status.REP_ONLINE_COMPLETE,
          n := training::NextStep.DO_IN_PERSON_OR_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_0010_0000'),
          s := training::Status.REP_ONLINE_COMPLETE_NO_IN_PERSON,
          n := training::NextStep.DO_IN_PERSON
      )) UNION (
          care := default::bin('1_1010_1111'),
          value := default::bin('0_0010_0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1011_1111'),
          value := default::bin('0_1011_0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1110_1111'),
          value := default::bin('1_0110_0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1111_0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      ))
  );
  CREATE GLOBAL default::PUB_SUB_SECRET -> std::str;
  CREATE FUNCTION default::notify_webhook(body: std::json) ->  std::net::http::ScheduledRequest USING (SELECT
      std::net::http::schedule_request('http://localhost:3000/api/db/webhook', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json'), ('Authorization', std::assert_exists(GLOBAL default::PUB_SUB_SECRET, message := 'PUB_SUB_SECRET is not set'))], body := std::to_bytes(body))
  );
  CREATE ABSTRACT TYPE default::_BaseListenable {
      CREATE TRIGGER send_delete
          AFTER DELETE
          FOR EACH DO (default::notify_webhook(<std::json>{
              type := __old__.__type__.name,
              action := 'delete',
              id := __old__.id
          }));
      CREATE TRIGGER send_insert
          AFTER INSERT
          FOR EACH DO (default::notify_webhook(<std::json>{
              type := __new__.__type__.name,
              action := 'insert',
              id := __new__.id
          }));
  };
  CREATE ABSTRACT TYPE default::Listenable EXTENDING default::_BaseListenable {
      CREATE TRIGGER send_update
          AFTER UPDATE
          FOR EACH DO (default::notify_webhook(<std::json>{
              type := __new__.__type__.name,
              action := 'update',
              id := __new__.id
          }));
  };
  CREATE ABSTRACT TYPE default::ListenableWithChanges EXTENDING default::_BaseListenable {
      CREATE TRIGGER send_update
          AFTER UPDATE
          FOR EACH DO (WITH
              old_values :=
                  std::json_object_unpack(<std::json>__old__ {
                      **
                  })
              ,
              new :=
                  <std::json>__new__ {
                      **
                  }
              ,
              changes :=
                  (FOR entry IN old_values
                  UNION
                      (WITH
                          key :=
                              entry.0
                          ,
                          value :=
                              entry.1
                          ,
                          new_value :=
                              std::json_get(new, key)
                      SELECT
                          (key, (<std::json>{
                              old := value,
                              new := new_value
                          } IF (value != new_value) ELSE {}))
                      ))
          SELECT
              default::notify_webhook(<std::json>{
                  type := __new__.__type__.name,
                  action := 'update',
                  id := __new__.id,
                  fields_changed := std::json_object_pack(changes)
              })
          );
  };
  ALTER TYPE sign_in::Agreement EXTENDING default::ListenableWithChanges LAST;
  ALTER TYPE sign_in::Location {
      ALTER PROPERTY in_of_hours_rep_multiplier {
          RENAME TO in_hours_rep_multiplier;
      };
      EXTENDING default::ListenableWithChanges LAST;
  };
  ALTER TYPE sign_in::SignIn EXTENDING default::Listenable LAST;
  ALTER TYPE users::User {
      DROP LINK referrals;
      EXTENDING default::Listenable LAST;
      ALTER LINK agreements_signed {
          ALTER PROPERTY version_signed {
              SET REQUIRED USING (0);
          };
      };
  };
  CREATE GLOBAL default::CDN_URL -> std::str;
  CREATE FUNCTION printing::cdn_url(id: std::uuid) ->  std::str USING (WITH
      root :=
          std::assert_exists(GLOBAL default::CDN_URL, message := 'CDN_URL is not set')
  SELECT
      '\(root)/prints/\(id)/'
  );
  CREATE ABSTRACT TYPE printing::PrintStatus;
  CREATE TYPE printing::Print {
      CREATE REQUIRED PROPERTY gcode_path := ('\(printing::cdn_url(.id))/.gcode');
      CREATE REQUIRED PROPERTY stl_path := ('\(printing::cdn_url(.id))/.stl');
      CREATE REQUIRED LINK approved_by: users::Rep;
      CREATE REQUIRED LINK author: users::User;
      CREATE REQUIRED PROPERTY duration: std::duration;
      CREATE REQUIRED PROPERTY mass: std::float32;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY type: printing::Type;
  };
  CREATE FUNCTION training::get_expiry_dates(user: users::User) ->  training::ExpiresReturn USING (SELECT
      std::assert_exists(std::assert_single(<training::ExpiresReturn>std::json_object_pack((FOR training IN user.training
      UNION
          (SELECT
              (<std::str>training.id, <std::json>'')
          )))))
  );
  CREATE FUNCTION users::send_infraction(body: std::json) ->  std::net::http::ScheduledRequest USING (SELECT
      std::net::http::schedule_request(std::assert_exists(GLOBAL default::INFRACTIONS_WEBHOOK_URL, message := 'INFRACTIONS_WEBHOOK_URL is not set'), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := std::to_bytes(body))
  );
  ALTER TYPE sign_in::SignIn {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
      ALTER PROPERTY signed_out {
          USING (EXISTS (.ends_at));
      };
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can operate on all sign-ins';
          };
      CREATE ACCESS POLICY view_self
          ALLOW SELECT USING ((GLOBAL default::user ?= .user)) {
              SET errmessage := 'Can only view your own sign-ins';
          };
      ALTER CONSTRAINT std::exclusive ON (.user) EXCEPT (.signed_out) {
          SET errmessage := 'User is currently signed in elsewhere';
      };
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
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update location info';
          };
      ALTER LINK queued {
          USING (SELECT
              .<location[IS sign_in::QueuePlace]
          FILTER
              (.ends_at < std::datetime_of_statement())
          );
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
  ALTER TYPE users::User {
      CREATE MULTI LINK sign_ins := (.<user[IS sign_in::SignIn]);
      ALTER LINK agreements_signed {
          ALTER PROPERTY created_at {
              SET REQUIRED USING (std::datetime_of_statement());
          };
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
      CREATE MULTI LINK integrations := (.<user[IS users::Integration]);
  };
  ALTER TYPE users::User {
      ALTER LINK notifications {
          ALTER PROPERTY acknowledged {
              RENAME TO acknowledged_at;
          };
      };
  };
  CREATE TYPE shop::Purchase EXTENDING default::Auditable {
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
      CREATE REQUIRED PROPERTY funds: std::int32 {
          SET default := 10_00;
          CREATE ANNOTATION std::description := 'Users get £10 credit a semester (in pence)';
      };
      CREATE ACCESS POLICY rep_or_higher
          ALLOW ALL USING (EXISTS (({'Rep', 'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := "Only reps can see everyone's profile";
          };
      CREATE ACCESS POLICY view_self
          ALLOW ALL USING ((GLOBAL default::user ?= __subject__)) {
              SET errmessage := 'Can only view your own profile';
          };
      ALTER PROPERTY ucard_number {
          CREATE ANNOTATION std::description := "The user's UCard number without the issue number (first 3 digits)";
      };
  };
  CREATE ABSTRACT TYPE dimensions::Dimension {
      CREATE REQUIRED LINK fields := (std::assert_exists((SELECT
          .__type__.pointers
      FILTER
          (.name NOT IN {'__type__', 'id', 'unit', 'formatted', 'fields'})
      )));
  };
  CREATE TYPE dimensions::Cuboid EXTENDING dimensions::Dimension {
      CREATE REQUIRED PROPERTY height: std::float64;
      CREATE REQUIRED PROPERTY length: std::float64;
      CREATE REQUIRED PROPERTY unit := ('mm');
      CREATE REQUIRED PROPERTY width: std::float64;
      CREATE REQUIRED PROPERTY formatted := ('\(.length) x \(.width) x \(.height)\(.unit)');
  };
  CREATE TYPE dimensions::Cylindrical EXTENDING dimensions::Dimension {
      CREATE REQUIRED PROPERTY diameter: std::float64;
      CREATE REQUIRED PROPERTY length: std::float64;
      CREATE REQUIRED PROPERTY unit := ('mm');
      CREATE REQUIRED PROPERTY formatted := ('\(.diameter)ø x \(.length)\(.unit)');
  };
  CREATE TYPE dimensions::ISO216 EXTENDING dimensions::Dimension {
      CREATE REQUIRED PROPERTY size: std::int16;
      CREATE PROPERTY thickness: std::float64;
      CREATE REQUIRED PROPERTY unit := ('A');
      CREATE REQUIRED PROPERTY formatted := (SELECT
          ('\(.unit)\(.size) - \(std::assert_exists(.thickness))mm' IF EXISTS (.thickness) ELSE '\(.unit)\(.size)')
      );
  };
  CREATE TYPE dimensions::LiquidVolume EXTENDING dimensions::Dimension {
      CREATE REQUIRED PROPERTY unit := ('L');
      CREATE REQUIRED PROPERTY volume: std::float64;
      CREATE REQUIRED PROPERTY formatted := ('\(.volume)\(.unit)');
  };
  CREATE TYPE dimensions::Mass EXTENDING dimensions::Dimension {
      CREATE REQUIRED PROPERTY mass: std::float64;
      CREATE REQUIRED PROPERTY unit := ('kg');
      CREATE REQUIRED PROPERTY formatted := ('\(.mass)\(.unit)');
  };
  CREATE TYPE dimensions::Thread EXTENDING dimensions::Dimension {
      CREATE REQUIRED PROPERTY diameter: std::float64;
      CREATE REQUIRED PROPERTY length: std::float64;
      CREATE REQUIRED PROPERTY unit := ('mm');
      CREATE REQUIRED PROPERTY formatted := ('M\(.diameter) x \(.length)\(.unit)');
  };
  CREATE TYPE shop::Skew EXTENDING default::Auditable {
      CREATE REQUIRED LINK _dimensions: dimensions::Dimension;
      CREATE REQUIRED PROPERTY dimensions := (std::assert_exists(<shop::DimensionType>std::json_object_pack({('__typename', <std::json>._dimensions.__type__.name), ('fields', <std::json>std::array_agg(._dimensions.fields {
          name,
          required
      })), std::json_object_unpack(std::assert_exists(std::json_get(<std::json>._dimensions {
          Cylindrical := [IS dimensions::Cylindrical] {
              length,
              diameter,
              unit
          },
          Thread := [IS dimensions::Thread] {
              length,
              diameter,
              unit
          },
          Cuboid := [IS dimensions::Cuboid] {
              length,
              width,
              height,
              unit
          },
          Mass := [IS dimensions::Mass] {
              mass,
              unit
          },
          LiquidVolume := [IS dimensions::LiquidVolume] {
              volume,
              unit
          },
          ISO216 := [IS dimensions::ISO216] {
              size,
              thickness,
              unit
          }
      }, (std::str_split(._dimensions.__type__.name, '::'))[-1])))})));
      CREATE PROPERTY colour: std::str;
      CREATE PROPERTY count: std::int16 {
          CREATE ANNOTATION std::description := "Empty if not stock isn't tracked";
      };
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
              SET REQUIRED USING (<std::datetime>{});
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
      CREATE REQUIRED LINK location: sign_in::Location {
          SET REQUIRED USING (<sign_in::Location>{});
      };
      ALTER LINK organiser {
          SET MULTI;
      };
      CREATE REQUIRED MULTI LINK required_training: training::Training {
          SET REQUIRED USING (<training::Training>{});
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
      CREATE REQUIRED MULTI LINK targets: (((((notification::AllReps | notification::MailingList) | notification::AllUsers) | event::Event) | team::Team) | users::User) {
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
      CREATE MULTI PROPERTY attachments: std::str {
          CREATE ANNOTATION std::description := 'The paths for the attachments to be uploaded on the CDN e.g. attachments/{id}.';
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
      CREATE REQUIRED LINK status: (printing::PrintStatus | printing::PrinterStatus);
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
      CREATE REQUIRED MULTI LINK skews: shop::Skew;
      CREATE REQUIRED PROPERTY icon_url: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY supplier: std::str;
      CREATE REQUIRED PROPERTY supplier_url: std::str;
  };
  ALTER TYPE shop::Skew {
      CREATE REQUIRED LINK item := (std::assert_exists(std::assert_single(shop::Item FILTER
          (__source__ IN .skews)
      )));
  };
  CREATE TYPE tools::Tool {
      CREATE REQUIRED PROPERTY is_bookable: std::bool;
      CREATE REQUIRED PROPERTY status: tuple<code: tools::Status, reason: std::str>;
      CREATE PROPERTY min_booking_time: std::duration {
          SET default := (SELECT
              (<std::duration>'1h' IF .is_bookable ELSE {})
          );
      };
      CREATE REQUIRED PROPERTY grouped: std::bool {
          SET default := false;
          CREATE ANNOTATION std::description := '\n                Whether this tool is grouped with another e.g. the metal pillar drill and the wood pillar drill and the wooden one\n            ';
      };
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED MULTI LINK training: training::Training {
          CREATE ANNOTATION std::description := 'The training required to unlock this tool';
      };
      CREATE REQUIRED MULTI LINK rep: training::Training {
          CREATE ANNOTATION std::description := 'The associated training that reps should have to supervise this. Empty if the training is for reps.';
      };
      CREATE TRIGGER check_rep
          AFTER UPDATE, INSERT
          FOR EACH DO (std::assert(NOT (EXISTS (__new__.rep.rep)), message := "Tool's rep training isn't rep training?"));
      CREATE MULTI LINK responsible_reps: users::Rep;
      CREATE MULTI PROPERTY bookable_hours: std::cal::local_time {
          CREATE ANNOTATION std::description := '\n                Empty means any time the location is open (or not bookable).\n            ';
      };
      CREATE REQUIRED PROPERTY borrowable: std::bool;
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE PROPERTY max_booking_daily: std::duration;
      CREATE PROPERTY max_booking_weekly: std::duration;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY quantity: std::int16;
  };
  ALTER TYPE shop::Item {
      CREATE MULTI LINK tools: tools::Tool {
          CREATE ANNOTATION std::description := 'Tools that can use this item';
      };
  };
  CREATE TYPE shop::LineItem {
      CREATE REQUIRED LINK wraps: shop::Item;
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
  ALTER TYPE sign_in::Agreement {
      CREATE ACCESS POLICY admin_only
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update agreements';
          };
      CREATE ACCESS POLICY view_rep
          ALLOW SELECT USING (((std::all((FOR category IN .reasons.category
          UNION
              (SELECT
                  (category = sign_in::ReasonCategory.REP_SIGN_IN)
              ))) AND (GLOBAL default::user IS users::Rep)) ?? false)) {
              SET errmessage := 'Only the rep can view this agreement';
          };
  };
  ALTER TYPE sign_in::QueuePlace {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
      CREATE ACCESS POLICY edit_self
          ALLOW ALL USING ((GLOBAL default::user ?= .user)) {
              SET errmessage := 'Only the desk account or admins can update registrations';
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
  ALTER TYPE sign_in::Reason {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update reasons';
          };
  };
  ALTER TYPE sign_in::UserRegistration {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE team::Team {
      DROP PROPERTY tag;
  };
  ALTER TYPE tools::Booking {
      CREATE REQUIRED LINK tool: tools::Tool {
          SET REQUIRED USING (<tools::Tool>{});
      };
      CREATE ACCESS POLICY is_bookable
          ALLOW UPDATE, INSERT USING ((.tool.is_bookable AND (.tool.status.code != tools::Status.OUT_OF_ORDER))) {
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
  CREATE TYPE tools::GroupedTool {
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED MULTI LINK tools: tools::Tool;
      CREATE TRIGGER check_grouped
          AFTER UPDATE, INSERT
          FOR EACH DO (SELECT
              std::assert(std::all(__new__.tools.grouped), message := 'All tools in a GroupedTool must have grouped := true')
          );
      CREATE TRIGGER check_locations
          AFTER UPDATE, INSERT
          FOR EACH DO (SELECT
              std::assert((std::count(DISTINCT (__new__.tools.location)) = 1), message := 'All tools in a GroupedTool must be in the same location')
          );
      CREATE TRIGGER check_trainings
          AFTER UPDATE, INSERT
          FOR EACH DO (WITH
              everything_must_have_training :=
                  DISTINCT (__new__.tools.training)
          SELECT
              std::assert(std::all((FOR tool IN __new__.tools
              UNION
                  (SELECT
                      (tool.training = everything_must_have_training)
                  ))), message := 'All tools in a GroupedTool must have the same training requirements')
          );
      CREATE REQUIRED MULTI LINK training: training::Training;
      CREATE REQUIRED PROPERTY name: std::str;
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
  ALTER TYPE training::Session {
      CREATE ACCESS POLICY allow_reps
          ALLOW INSERT USING (WITH
              user :=
                  GLOBAL default::user
          SELECT
              (NOT (EXISTS (.training.rep)) OR EXISTS (({'Rep'} INTERSECT user.roles.name)))
          ) {
              SET errmessage := 'Only reps can complete rep training';
          };
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE ACCESS POLICY allow_self_or_admin
          ALLOW ALL USING (WITH
              user :=
                  GLOBAL default::user
          SELECT
              (EXISTS (({'Admin'} INTERSECT user.roles.name)) OR (user ?= .user))
          ) {
              SET errmessage := 'Only self/admins can view sessions';
          };
      CREATE LINK next_section := (SELECT
          .training.sections FILTER
              (.enabled AND (.index > __source__.index))
          ORDER BY
              .index ASC
      LIMIT
          1
      );
  };
  ALTER TYPE training::Training {
      CREATE ACCESS POLICY allow_reps_view_rep
          DENY ALL USING (WITH
              user :=
                  GLOBAL default::user
          SELECT
              (((user IS NOT users::Rep) AND NOT (EXISTS (.rep))) ?? false)
          ) {
              SET errmessage := 'Only reps can view rep training';
          };
      CREATE ACCESS POLICY desk_or_higher_edit
          ALLOW ALL USING (WITH
              user :=
                  GLOBAL default::user
          SELECT
              ((EXISTS (({'Admin'} INTERSECT user.roles.name)) OR ((user IS users::Rep) AND EXISTS (({'H&S'} INTERSECT user[IS users::Rep].teams.name)))) ?? false)
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
      CREATE ACCESS POLICY select_if_completed_basic
          ALLOW SELECT USING (WITH
              user :=
                  GLOBAL default::user
          SELECT
              (NOT (EXISTS (.rep)) AND (__subject__ IN user.training.rep))
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
      DROP CONSTRAINT std::exclusive ON ((.name, .rep));
      DROP INDEX std::fts::index ON (std::fts::with_options(.name, language := std::fts::Language.eng));
      ALTER PROPERTY expires_after {
          SET default := (<std::cal::relative_duration>'P1Y');
          SET REQUIRED USING (<std::duration>'PT8760H');
          SET TYPE std::cal::relative_duration USING (<std::cal::relative_duration>.expires_after);
      };
  };
  ALTER TYPE users::Infraction {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update infractions';
          };
      CREATE TRIGGER log_insert
          AFTER INSERT
          FOR EACH DO (WITH
              sign_in :=
                  (SELECT
                      __new__.user.sign_ins FILTER
                          NOT (.signed_out)
                  LIMIT
                      1
                  )
              ,
              supervising_reps :=
                  sign_in.location.supervising_reps
          SELECT
              users::send_infraction(<std::json>{
                  embeds := [{
                      title := 'User Infraction Added to \(__new__.user.display_name)',
                      description := (((('Type: \(__new__.type)\n' ++ 'Reason: \(__new__.reason)\n') ++ 'Supervising Reps: \(std::array_join(std::array_agg(supervising_reps.display_name), ', '))\n') ++ 'Resolved: \(__new__.resolved)\n\n') ++ ('Ends <t:\(std::datetime_get(__new__.ends_at, 'epochseconds'))>' IF EXISTS (__new__.duration) ELSE '')),
                      color := 10953233,
                      url := 'https://iforge.sheffield.ac.uk/users/\(__new__.user.id)',
                      thumbnail := {
                          url := __new__.user.profile_picture
                      }
                  }]
              })
          );
      CREATE TRIGGER log_update
          AFTER UPDATE
          FOR EACH DO (SELECT
              users::send_infraction(<std::json>{
                  embeds := [{
                      title := 'User Infraction Updated for \(__new__.user.display_name)',
                      description := ((('Type: \(__new__.type)\n' ++ 'Reason: \(__new__.reason)\n') ++ 'Resolved: \(__new__.resolved)\n\n') ++ ('Ends <t:\(std::datetime_get(__new__.ends_at, 'epochseconds'))>' IF EXISTS (__new__.duration) ELSE '')),
                      color := 10953233,
                      url := 'https://iforge.sheffield.ac.uk/users/\(__new__.user.id)',
                      thumbnail := {
                          url := __new__.user.profile_picture
                      }
                  }]
              })
          );
  };
  ALTER TYPE users::Integration {
      DROP INDEX ON ((.platform, .external_id));
      DROP INDEX ON ((.platform, .user));
  };
  DROP SCALAR TYPE notification::AllTargetTarget;
  DROP SCALAR TYPE training::Selectability;
};
