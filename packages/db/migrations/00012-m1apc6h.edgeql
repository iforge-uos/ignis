CREATE MIGRATION m1apc6h5yh6f5yudkmvldt4d6zlyxawolzz7w5br4i2loed37przia
    ONTO m1uuyy7z7l6xneaywt2jfgkfnxy6lxgpi3pgqjrplyymf3tgxr5hkq
{
  CREATE EXTENSION pgvector VERSION '0.7';
  CREATE EXTENSION ai VERSION '1.0';
  CREATE MODULE ai_rep IF NOT EXISTS;
  CREATE MODULE printing IF NOT EXISTS;
  CREATE MODULE printing::print_status IF NOT EXISTS;
  CREATE MODULE printing::printer_status IF NOT EXISTS;
  CREATE MODULE shop IF NOT EXISTS;
  CREATE MODULE shop::dimensions IF NOT EXISTS;
  CREATE MODULE tools IF NOT EXISTS;
  ALTER SCALAR TYPE event::EventType RENAME TO event::Type;
  CREATE SCALAR TYPE printing::Type EXTENDING enum<PLA, TPU, PETG, RESIN>;
  CREATE SCALAR TYPE printing::print_status::FailureReason EXTENDING enum<NO_EXTRUSION_AT_PRINT_START, POOR_BED_ADHESION, UNDER_EXTRUSION, OVER_EXTRUSION, GAPS_IN_TOP_LAYERS, STRINGING_AND_OOZING, OVERHEATING, LAYER_SHIFTING, LAYER_SEPARATION_AND_SPLITTING, FILAMENT_GRINDING, EXTRUDER_CLOG, EXTRUSION_STOPS_MID_PRINT, WEAK_INFILL, BLOBS_AND_ZITS, GAPS_BETWEEN_INFILL_AND_PERIMETER, CORNER_CURLING_AND_ROUGHNESS, TOP_SURFACE_SCARRING, CORNER_GAPS_IN_BOTTOM_LAYER, LAYER_LINES_ON_SIDES, VIBRATION_AND_RINGING, THIN_WALL_GAPS, SMALL_FEATURE_LOSS, INCONSISTENT_EXTRUSION, WARPING, POOR_OVERHANG_QUALITY, DIMENSIONAL_INACCURACY, POOR_BRIDGING, FILAMENT_FEEDING, FILAMENT_RAN_OUT, NOT_A_CLUE>;
  CREATE SCALAR TYPE printing::printer_status::FailureReason EXTENDING enum<MAIN_CONTROLLER_BOARD, POWER_SUPPLY, DISPLAY_BOARD, WIFI_MODULE, HOTEND_THERMISTOR, HEATBED_THERMISTOR, HOTEND_HEATER_CARTRIDGE, HEATBED_HEATING_ELEMENT, HEATER_BLOCK, EXTRUDER_MOTOR, X_AXIS_MOTOR, Y_AXIS_MOTOR, Z_AXIS_MOTOR, LINEAR_RAILS, LINEAR_BEARINGS, BELT_SYSTEM, PULLEYS, LEAD_SCREW_NUT, HOTEND_FAN, PART_COOLING_FAN, CHAMBER_FAN, POWER_SUPPLY_FAN, NOZZLE, HEAT_BREAK, HEAT_SINK, EXTRUDER_GEARS, BOWDEN_TUBE, FILAMENT_SENSOR, BED_LEVELING_SENSOR, DOOR_SENSOR, CRASH_DETECTION_SENSOR, POWER_PANIC_SENSOR, PRINT_BED_SURFACE, BED_LEVELLING_SPRINGS, BED_MOUNTING_HARDWARE, HOTEND_WIRING, HEATBED_WIRING, MOTOR_WIRING, MAIN_POWER_CABLE, USB_CONNECTION, FRAME_COMPONENTS, SMOOTH_RODS, ENCLOSURE_PANELS, FILAMENT_FEEDING>;
  CREATE SCALAR TYPE team::Name EXTENDING enum<IT, `3DP`, Hardware, Publicity, Events, Relations, Operations, `Recruitment & Development`, `Health & Safety`, Inclusions, `Unsorted Reps`, `Future Reps`, Staff>;
  CREATE SCALAR TYPE tools::Selectability EXTENDING enum<UNTRAINED, REVOKED, EXPIRED, REPS_UNTRAINED, IN_PERSON_MISSING>;
  CREATE SCALAR TYPE tools::Status EXTENDING enum<NOMINAL, IN_USE, OUT_OF_ORDER>;
  ALTER TYPE users::Rep {
      ALTER LINK teams {
          CREATE PROPERTY team_lead: array<tuple<created_at: std::datetime, ends_at: std::datetime>>;
      };
  };
  CREATE FUNCTION shop::get_quantities(type_: schema::ObjectType) -> SET OF std::str USING (SELECT
      (std::assert_exists((SELECT
          type_.pointers
      FILTER
          (.name NOT IN {'__type__', 'id', 'unit', 'formatted', 'quantities'})
      ))).name
  );
  CREATE GLOBAL default::CDN_URL -> std::str;
  CREATE ABSTRACT TYPE printing::PrintStatus;
  CREATE TYPE printing::Print {
      CREATE REQUIRED PROPERTY gcode_path := ('\(std::assert_exists(GLOBAL default::CDN_URL))/prints/\(.id)/.gcode');
      CREATE REQUIRED PROPERTY stl_path := ('\(std::assert_exists(GLOBAL default::CDN_URL))/prints/\(.id)/.stl');
      CREATE REQUIRED LINK approved_by: users::Rep;
      CREATE REQUIRED LINK author: users::User;
      CREATE REQUIRED PROPERTY duration: std::duration;
      CREATE REQUIRED PROPERTY mass: std::float32;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY type: printing::Type;
  };
  CREATE ABSTRACT TYPE shop::Dimension;
  ALTER TYPE sign_in::SignIn {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE users::User {
      ALTER LINK agreements_signed {
          ALTER PROPERTY version_signed {
              SET REQUIRED USING (0);
          };
      };
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK integrations := (.<user[IS users::Integration]);
  };
  ALTER TYPE users::User {
      ALTER LINK notifications {
          ALTER PROPERTY acknowledged {
              RENAME TO acknowledged_at;
          };
      };
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK sign_ins := (.<user[IS sign_in::SignIn]);
  };
  ALTER TYPE users::User {
      CREATE REQUIRED PROPERTY funds: std::int32 {
          SET default := 10_00;
          CREATE ANNOTATION std::description := 'Users get £10 credit a semester (in pence)';
      };
  };
  ALTER GLOBAL default::user USING (std::assert_single((SELECT
      users::User
  FILTER
      (.username = 'eik21jh')
  )));
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
  ALTER TYPE sign_in::Location {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update location info';
          };
  };
  ALTER TYPE sign_in::QueuePlace {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE ACCESS POLICY edit_self
          ALLOW ALL USING ((GLOBAL default::user ?= .user)) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
  };
  ALTER TYPE sign_in::Reason {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update reasons';
          };
  };
  ALTER TYPE sign_in::SignIn {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can operate on all sign-ins';
          };
      CREATE ACCESS POLICY view_self
          ALLOW SELECT USING ((GLOBAL default::user ?= .user)) {
              SET errmessage := 'Can only view your own sign-ins';
          };
      ALTER PROPERTY signed_out {
          USING (EXISTS (.ends_at));
      };
      ALTER CONSTRAINT std::exclusive ON (.user) EXCEPT (.signed_out) {
          SET errmessage := 'User is currently signed in elsewhere';
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
      CREATE ACCESS POLICY select_if_completed_basic
          ALLOW SELECT USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              (NOT (EXISTS (.rep)) AND (__subject__ IN user.training.rep))
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
      DROP CONSTRAINT std::exclusive ON ((.name, .rep));
      DROP INDEX std::fts::index ON (std::fts::with_options(.name, language := std::fts::Language.eng));
  };
};
