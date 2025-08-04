CREATE MIGRATION m15nad63f4wcxw7xnj2uh277mkro4wexlhpw4nbtrixzrlqtjdrpnq
    ONTO m1b6ansbmppb66fsybb4k37q4xrlwqv3iyk2tqe5wgvwxftsjqtmjq
{
  CREATE MODULE printing IF NOT EXISTS;
  CREATE MODULE printing::print_status IF NOT EXISTS;
  CREATE MODULE printing::printer_status IF NOT EXISTS;
  CREATE SCALAR TYPE printing::Type EXTENDING enum<PLA, TPU, PETG, RESIN>;
  CREATE SCALAR TYPE printing::print_status::FailureReason EXTENDING enum<NO_EXTRUSION_AT_PRINT_START, POOR_BED_ADHESION, UNDER_EXTRUSION, OVER_EXTRUSION, GAPS_IN_TOP_LAYERS, STRINGING_AND_OOZING, OVERHEATING, LAYER_SHIFTING, LAYER_SEPARATION_AND_SPLITTING, FILAMENT_GRINDING, EXTRUDER_CLOG, EXTRUSION_STOPS_MID_PRINT, WEAK_INFILL, BLOBS_AND_ZITS, GAPS_BETWEEN_INFILL_AND_PERIMETER, CORNER_CURLING_AND_ROUGHNESS, TOP_SURFACE_SCARRING, CORNER_GAPS_IN_BOTTOM_LAYER, LAYER_LINES_ON_SIDES, VIBRATION_AND_RINGING, THIN_WALL_GAPS, SMALL_FEATURE_LOSS, INCONSISTENT_EXTRUSION, WARPING, POOR_OVERHANG_QUALITY, DIMENSIONAL_INACCURACY, POOR_BRIDGING, FILAMENT_FEEDING, FILAMENT_RAN_OUT, NOT_A_CLUE>;
  CREATE SCALAR TYPE printing::printer_status::FailureReason EXTENDING enum<MAIN_CONTROLLER_BOARD, POWER_SUPPLY, DISPLAY_BOARD, WIFI_MODULE, HOTEND_THERMISTOR, HEATBED_THERMISTOR, HOTEND_HEATER_CARTRIDGE, HEATBED_HEATING_ELEMENT, HEATER_BLOCK, EXTRUDER_MOTOR, X_AXIS_MOTOR, Y_AXIS_MOTOR, Z_AXIS_MOTOR, LINEAR_RAILS, LINEAR_BEARINGS, BELT_SYSTEM, PULLEYS, LEAD_SCREW_NUT, HOTEND_FAN, PART_COOLING_FAN, CHAMBER_FAN, POWER_SUPPLY_FAN, NOZZLE, HEAT_BREAK, HEAT_SINK, EXTRUDER_GEARS, BOWDEN_TUBE, FILAMENT_SENSOR, BED_LEVELING_SENSOR, DOOR_SENSOR, CRASH_DETECTION_SENSOR, POWER_PANIC_SENSOR, PRINT_BED_SURFACE, BED_LEVELLING_SPRINGS, BED_MOUNTING_HARDWARE, HOTEND_WIRING, HEATBED_WIRING, MOTOR_WIRING, MAIN_POWER_CABLE, USB_CONNECTION, FRAME_COMPONENTS, SMOOTH_RODS, ENCLOSURE_PANELS, FILAMENT_FEEDING>;
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
          (.`on`.printer = __source__)
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
  CREATE TYPE printing::print_status::Printing EXTENDING printing::PrintStatus {
      CREATE REQUIRED LINK print: printing::Print;
  };
  CREATE TYPE printing::printer_status::Printing EXTENDING printing::PrinterStatus {
      CREATE REQUIRED LINK print: printing::Print;
  };
  CREATE TYPE printing::print_status::Cancelled EXTENDING printing::PrintStatus;
  CREATE TYPE printing::print_status::Complete EXTENDING printing::PrintStatus;
  CREATE TYPE printing::print_status::Failed EXTENDING printing::PrintStatus {
      CREATE PROPERTY note: std::str;
      CREATE REQUIRED PROPERTY reason: printing::print_status::FailureReason;
  };
  CREATE TYPE printing::print_status::Queued EXTENDING printing::PrintStatus;
  CREATE TYPE printing::printer_status::Disabled EXTENDING printing::PrinterStatus;
  CREATE TYPE printing::printer_status::Disconnected EXTENDING printing::PrinterStatus;
  CREATE TYPE printing::printer_status::Failed EXTENDING printing::PrinterStatus {
      CREATE REQUIRED PROPERTY note: std::str;
      CREATE REQUIRED PROPERTY reason: printing::printer_status::FailureReason;
  };
  CREATE TYPE printing::printer_status::Idle EXTENDING printing::PrinterStatus;
  ALTER TYPE sign_in::Location {
      DROP INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON ('\nName: \(std::str_title(<std::str>.name))\nOpening time: \(.opening_time)\nClosing time: \(.closing_time)\n        ');
  };
  ALTER TYPE team::Team {
      DROP PROPERTY tag;
  };
  ALTER TYPE tools::Tool {
      CREATE REQUIRED LINK rep: training::Training {
          SET REQUIRED USING (<training::Training>{});
          CREATE ANNOTATION std::description := 'The associated training that reps should have to supervise this. Empty if the training is for reps.';
      };
      ALTER LINK training {
          CREATE ANNOTATION std::description := 'The training required to unlock this tool';
      };
  };
  ALTER TYPE training::Session {
      DROP ACCESS POLICY allow_reps;
      DROP ACCESS POLICY allow_self_or_admin;
  };
  ALTER TYPE training::Training {
      DROP CONSTRAINT std::exclusive ON ((.name, .rep));
      DROP INDEX std::fts::index ON (std::fts::with_options(.name, language := std::fts::Language.eng));
  };
};
