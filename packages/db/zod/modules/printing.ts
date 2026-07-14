import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region printing::Drivers
export const DriversSchema = z.enum(["OCTOPRINT", "PRUSALINK", "BAMBU"]);
// #endregion

// #region printing::Material
export const MaterialSchema = z.enum(["PLA", "TPU", "PETG"]);
// #endregion

// #region printing::print_status::FailureReason
export const print_status_FailureReasonSchema = z.enum(["NO_EXTRUSION_AT_PRINT_START", "POOR_BED_ADHESION", "UNDER_EXTRUSION", "OVER_EXTRUSION", "GAPS_IN_TOP_LAYERS", "STRINGING_AND_OOZING", "OVERHEATING", "LAYER_SHIFTING", "LAYER_SEPARATION_AND_SPLITTING", "FILAMENT_GRINDING", "EXTRUDER_CLOG", "EXTRUSION_STOPS_MID_PRINT", "WEAK_INFILL", "BLOBS_AND_ZITS", "GAPS_BETWEEN_INFILL_AND_PERIMETER", "CORNER_CURLING_AND_ROUGHNESS", "TOP_SURFACE_SCARRING", "CORNER_GAPS_IN_BOTTOM_LAYER", "LAYER_LINES_ON_SIDES", "VIBRATION_AND_RINGING", "THIN_WALL_GAPS", "SMALL_FEATURE_LOSS", "INCONSISTENT_EXTRUSION", "WARPING", "POOR_OVERHANG_QUALITY", "DIMENSIONAL_INACCURACY", "POOR_BRIDGING", "FILAMENT_FEEDING", "FILAMENT_RAN_OUT", "NOT_A_CLUE", "OTHER"]);
// #endregion

// #region printing::printer_status::FailureReason
export const printer_status_FailureReasonSchema = z.enum(["MAIN_CONTROLLER_BOARD", "POWER_SUPPLY", "DISPLAY_BOARD", "WIFI_MODULE", "HOTEND_THERMISTOR", "HEATBED_THERMISTOR", "HOTEND_HEATER_CARTRIDGE", "HEATBED_HEATING_ELEMENT", "HEATER_BLOCK", "EXTRUDER_MOTOR", "X_AXIS_MOTOR", "Y_AXIS_MOTOR", "Z_AXIS_MOTOR", "LINEAR_RAILS", "LINEAR_BEARINGS", "BELT_SYSTEM", "PULLEYS", "LEAD_SCREW_NUT", "HOTEND_FAN", "PART_COOLING_FAN", "CHAMBER_FAN", "POWER_SUPPLY_FAN", "NOZZLE", "HEAT_BREAK", "HEAT_SINK", "EXTRUDER_GEARS", "BOWDEN_TUBE", "FILAMENT_SENSOR", "BED_LEVELING_SENSOR", "DOOR_SENSOR", "CRASH_DETECTION_SENSOR", "POWER_PANIC_SENSOR", "PRINT_BED_SURFACE", "BED_LEVELLING_SPRINGS", "BED_MOUNTING_HARDWARE", "HOTEND_WIRING", "HEATBED_WIRING", "MOTOR_WIRING", "MAIN_POWER_CABLE", "USB_CONNECTION", "FRAME_COMPONENTS", "SMOOTH_RODS", "ENCLOSURE_PANELS", "FILAMENT_FEEDING", "OTHER"]);
// #endregion

// #region printing::Priority
export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
// #endregion

// #region printing::QueueType
export const QueueTypeSchema = z.enum(["PLA", "PETG", "TPU", "MULTI"]);
// #endregion

// #region printing::AuditEntry
export const CreateAuditEntrySchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // printing::AuditEntry
  });

export const UpdateAuditEntrySchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // printing::AuditEntry
  });
// #endregion

// #region printing::Downtime
export const CreateDowntimeSchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // printing::Downtime
    end_time: zt.zonedDateTime().nullable(), // std::datetime
    start_time: zt.zonedDateTime(), // std::datetime
    reason: z.string().nullable(), // std::str
  });

export const UpdateDowntimeSchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // printing::Downtime
    end_time: zt.zonedDateTime().nullable(), // std::datetime
    start_time: zt.zonedDateTime(), // std::datetime
    reason: z.string().nullable(), // std::str
  });
// #endregion

// #region printing::Print
export const CreatePrintSchema = z.
  object({
    duration: zt.duration(), // std::duration
    mass: z.number().min(-3.40282347e+38).max(3.40282347e+38), // std::float32
    name: z.string(), // std::str
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]), // printing::Priority
    reason: z.string().nullable(), // std::str
    filament: z.tuple([
      z.enum(["PLA", "TPU", "PETG"]),
      z.string(),
      z.int().min(-32768).max(32767),
      z.int().min(-32768).max(32767),
      z.int().min(-32768).max(32767),
    ]).array(), // array<tuple<material:printing::Material, colour:std::str, nozzle_temp_min:std::int16, nozzle_temp_max:std::int16, bed_temp:std::int16>>
  });

export const UpdatePrintSchema = z.
  object({
    duration: zt.duration(), // std::duration
    mass: z.number().min(-3.40282347e+38).max(3.40282347e+38), // std::float32
    name: z.string(), // std::str
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]), // printing::Priority
    reason: z.string().nullable(), // std::str
    filament: z.tuple([
      z.enum(["PLA", "TPU", "PETG"]),
      z.string(),
      z.int().min(-32768).max(32767),
      z.int().min(-32768).max(32767),
      z.int().min(-32768).max(32767),
    ]).array(), // array<tuple<material:printing::Material, colour:std::str, nozzle_temp_min:std::int16, nozzle_temp_max:std::int16, bed_temp:std::int16>>
  });
// #endregion

// #region printing::print_status::Cancelled
export const Createprint_status_CancelledSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Cancelled
  });

export const Updateprint_status_CancelledSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Cancelled
  });
// #endregion

// #region printing::print_status::Complete
export const Createprint_status_CompleteSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Complete
  });

export const Updateprint_status_CompleteSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Complete
  });
// #endregion

// #region printing::print_status::Failed
export const Createprint_status_FailedSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Failed
    note: z.string().nullable(), // std::str
    reason: z.enum(["NO_EXTRUSION_AT_PRINT_START", "POOR_BED_ADHESION", "UNDER_EXTRUSION", "OVER_EXTRUSION", "GAPS_IN_TOP_LAYERS", "STRINGING_AND_OOZING", "OVERHEATING", "LAYER_SHIFTING", "LAYER_SEPARATION_AND_SPLITTING", "FILAMENT_GRINDING", "EXTRUDER_CLOG", "EXTRUSION_STOPS_MID_PRINT", "WEAK_INFILL", "BLOBS_AND_ZITS", "GAPS_BETWEEN_INFILL_AND_PERIMETER", "CORNER_CURLING_AND_ROUGHNESS", "TOP_SURFACE_SCARRING", "CORNER_GAPS_IN_BOTTOM_LAYER", "LAYER_LINES_ON_SIDES", "VIBRATION_AND_RINGING", "THIN_WALL_GAPS", "SMALL_FEATURE_LOSS", "INCONSISTENT_EXTRUSION", "WARPING", "POOR_OVERHANG_QUALITY", "DIMENSIONAL_INACCURACY", "POOR_BRIDGING", "FILAMENT_FEEDING", "FILAMENT_RAN_OUT", "NOT_A_CLUE", "OTHER"]), // printing::print_status::FailureReason
  });

export const Updateprint_status_FailedSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Failed
    note: z.string().nullable(), // std::str
    reason: z.enum(["NO_EXTRUSION_AT_PRINT_START", "POOR_BED_ADHESION", "UNDER_EXTRUSION", "OVER_EXTRUSION", "GAPS_IN_TOP_LAYERS", "STRINGING_AND_OOZING", "OVERHEATING", "LAYER_SHIFTING", "LAYER_SEPARATION_AND_SPLITTING", "FILAMENT_GRINDING", "EXTRUDER_CLOG", "EXTRUSION_STOPS_MID_PRINT", "WEAK_INFILL", "BLOBS_AND_ZITS", "GAPS_BETWEEN_INFILL_AND_PERIMETER", "CORNER_CURLING_AND_ROUGHNESS", "TOP_SURFACE_SCARRING", "CORNER_GAPS_IN_BOTTOM_LAYER", "LAYER_LINES_ON_SIDES", "VIBRATION_AND_RINGING", "THIN_WALL_GAPS", "SMALL_FEATURE_LOSS", "INCONSISTENT_EXTRUSION", "WARPING", "POOR_OVERHANG_QUALITY", "DIMENSIONAL_INACCURACY", "POOR_BRIDGING", "FILAMENT_FEEDING", "FILAMENT_RAN_OUT", "NOT_A_CLUE", "OTHER"]), // printing::print_status::FailureReason
  });
// #endregion

// #region printing::print_status::Printing
export const Createprint_status_PrintingSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Printing
  });

export const Updateprint_status_PrintingSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Printing
  });
// #endregion

// #region printing::print_status::Queued
export const Createprint_status_QueuedSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Queued
  });

export const Updateprint_status_QueuedSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Queued
  });
// #endregion

// #region printing::print_status::UnderReview
export const Createprint_status_UnderReviewSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::UnderReview
  });

export const Updateprint_status_UnderReviewSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::UnderReview
  });
// #endregion

// #region printing::PrintAuditEntry
export const CreatePrintAuditEntrySchema = z.
  object({ // printing::AuditEntry
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // printing::PrintAuditEntry
  });

export const UpdatePrintAuditEntrySchema = z.
  object({ // printing::AuditEntry
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // printing::PrintAuditEntry
  });
// #endregion

// #region printing::Printer
export const CreatePrinterSchema = z.
  object({
    has_camera: z.boolean(), // std::bool
    model: z.string(), // std::str
    manufacturer: z.string(), // std::str
    total_print_mass: z.number().min(-3.40282347e+38).max(3.40282347e+38), // std::float32
    total_print_time: zt.duration(), // std::duration
    ip: z.string(), // std::str
    keys: z.string().array(), // array<std::str>
    filament: z.tuple([
      z.enum(["PLA", "TPU", "PETG"]),
      z.string(),
      z.int().min(-32768).max(32767),
      z.int().min(-32768).max(32767),
      z.int().min(-32768).max(32767),
    ]).array(), // array<tuple<material:printing::Material, colour:std::str, nozzle_temp_min:std::int16, nozzle_temp_max:std::int16, bed_temp:std::int16>>
    name: z.string(), // std::str
    old: z.boolean().optional(), // std::bool
    driver: z.enum(["OCTOPRINT", "PRUSALINK", "BAMBU"]).optional(), // printing::Drivers
  });

export const UpdatePrinterSchema = z.
  object({
    has_camera: z.boolean(), // std::bool
    model: z.string(), // std::str
    manufacturer: z.string(), // std::str
    total_print_mass: z.number().min(-3.40282347e+38).max(3.40282347e+38), // std::float32
    total_print_time: zt.duration(), // std::duration
    ip: z.string(), // std::str
    keys: z.string().array(), // array<std::str>
    filament: z.tuple([
      z.enum(["PLA", "TPU", "PETG"]),
      z.string(),
      z.int().min(-32768).max(32767),
      z.int().min(-32768).max(32767),
      z.int().min(-32768).max(32767),
    ]).array(), // array<tuple<material:printing::Material, colour:std::str, nozzle_temp_min:std::int16, nozzle_temp_max:std::int16, bed_temp:std::int16>>
    name: z.string(), // std::str
    old: z.boolean().optional(), // std::bool
    driver: z.enum(["OCTOPRINT", "PRUSALINK", "BAMBU"]).optional(), // printing::Drivers
  });
// #endregion

// #region printing::printer_status::Disabled
export const Createprinter_status_DisabledSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Disabled
    end_time: zt.zonedDateTime().nullable(), // std::datetime
  });

export const Updateprinter_status_DisabledSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Disabled
    end_time: zt.zonedDateTime().nullable(), // std::datetime
  });
// #endregion

// #region printing::printer_status::Disconnected
export const Createprinter_status_DisconnectedSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Disconnected
  });

export const Updateprinter_status_DisconnectedSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Disconnected
  });
// #endregion

// #region printing::printer_status::Failed
export const Createprinter_status_FailedSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Failed
    note: z.string(), // std::str
    reason: z.enum(["MAIN_CONTROLLER_BOARD", "POWER_SUPPLY", "DISPLAY_BOARD", "WIFI_MODULE", "HOTEND_THERMISTOR", "HEATBED_THERMISTOR", "HOTEND_HEATER_CARTRIDGE", "HEATBED_HEATING_ELEMENT", "HEATER_BLOCK", "EXTRUDER_MOTOR", "X_AXIS_MOTOR", "Y_AXIS_MOTOR", "Z_AXIS_MOTOR", "LINEAR_RAILS", "LINEAR_BEARINGS", "BELT_SYSTEM", "PULLEYS", "LEAD_SCREW_NUT", "HOTEND_FAN", "PART_COOLING_FAN", "CHAMBER_FAN", "POWER_SUPPLY_FAN", "NOZZLE", "HEAT_BREAK", "HEAT_SINK", "EXTRUDER_GEARS", "BOWDEN_TUBE", "FILAMENT_SENSOR", "BED_LEVELING_SENSOR", "DOOR_SENSOR", "CRASH_DETECTION_SENSOR", "POWER_PANIC_SENSOR", "PRINT_BED_SURFACE", "BED_LEVELLING_SPRINGS", "BED_MOUNTING_HARDWARE", "HOTEND_WIRING", "HEATBED_WIRING", "MOTOR_WIRING", "MAIN_POWER_CABLE", "USB_CONNECTION", "FRAME_COMPONENTS", "SMOOTH_RODS", "ENCLOSURE_PANELS", "FILAMENT_FEEDING", "OTHER"]), // printing::printer_status::FailureReason
  });

export const Updateprinter_status_FailedSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Failed
    note: z.string(), // std::str
    reason: z.enum(["MAIN_CONTROLLER_BOARD", "POWER_SUPPLY", "DISPLAY_BOARD", "WIFI_MODULE", "HOTEND_THERMISTOR", "HEATBED_THERMISTOR", "HOTEND_HEATER_CARTRIDGE", "HEATBED_HEATING_ELEMENT", "HEATER_BLOCK", "EXTRUDER_MOTOR", "X_AXIS_MOTOR", "Y_AXIS_MOTOR", "Z_AXIS_MOTOR", "LINEAR_RAILS", "LINEAR_BEARINGS", "BELT_SYSTEM", "PULLEYS", "LEAD_SCREW_NUT", "HOTEND_FAN", "PART_COOLING_FAN", "CHAMBER_FAN", "POWER_SUPPLY_FAN", "NOZZLE", "HEAT_BREAK", "HEAT_SINK", "EXTRUDER_GEARS", "BOWDEN_TUBE", "FILAMENT_SENSOR", "BED_LEVELING_SENSOR", "DOOR_SENSOR", "CRASH_DETECTION_SENSOR", "POWER_PANIC_SENSOR", "PRINT_BED_SURFACE", "BED_LEVELLING_SPRINGS", "BED_MOUNTING_HARDWARE", "HOTEND_WIRING", "HEATBED_WIRING", "MOTOR_WIRING", "MAIN_POWER_CABLE", "USB_CONNECTION", "FRAME_COMPONENTS", "SMOOTH_RODS", "ENCLOSURE_PANELS", "FILAMENT_FEEDING", "OTHER"]), // printing::printer_status::FailureReason
  });
// #endregion

// #region printing::printer_status::Finished
export const Createprinter_status_FinishedSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Finished
  });

export const Updateprinter_status_FinishedSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Finished
  });
// #endregion

// #region printing::printer_status::Idle
export const Createprinter_status_IdleSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Idle
  });

export const Updateprinter_status_IdleSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Idle
  });
// #endregion

// #region printing::printer_status::Paused
export const Createprinter_status_PausedSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Paused
  });

export const Updateprinter_status_PausedSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Paused
  });
// #endregion

// #region printing::printer_status::Printing
export const Createprinter_status_PrintingSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Printing
  });

export const Updateprinter_status_PrintingSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Printing
  });
// #endregion

// #region printing::PrinterAuditEntry
export const CreatePrinterAuditEntrySchema = z.
  object({ // printing::AuditEntry
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // printing::PrinterAuditEntry
  });

export const UpdatePrinterAuditEntrySchema = z.
  object({ // printing::AuditEntry
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // printing::PrinterAuditEntry
  });
// #endregion

// #region printing::PrinterStatus
export const CreatePrinterStatusSchema = z.
  object({
  });

export const UpdatePrinterStatusSchema = z.
  object({
  });
// #endregion

// #region printing::PrintHistory
export const CreatePrintHistorySchema = z.
  object({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // printing::PrintHistory
    attempts: z.int().min(-32768).max(32767).optional(), // std::int16
    has_timelapse: z.boolean(), // std::bool
    created_at: zt.zonedDateTime().optional(), // std::datetime
  });

export const UpdatePrintHistorySchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // printing::PrintHistory
    attempts: z.int().min(-32768).max(32767).optional(), // std::int16
    has_timelapse: z.boolean(), // std::bool
  });
// #endregion

// #region printing::PrintStatus
export const CreatePrintStatusSchema = z.
  object({
  });

export const UpdatePrintStatusSchema = z.
  object({
  });
// #endregion
