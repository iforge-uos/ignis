import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region printing::print_status::FailureReason
export const print_statusSchema = z.enum(["NO_EXTRUSION_AT_PRINT_START", "POOR_BED_ADHESION", "UNDER_EXTRUSION", "OVER_EXTRUSION", "GAPS_IN_TOP_LAYERS", "STRINGING_AND_OOZING", "OVERHEATING", "LAYER_SHIFTING", "LAYER_SEPARATION_AND_SPLITTING", "FILAMENT_GRINDING", "EXTRUDER_CLOG", "EXTRUSION_STOPS_MID_PRINT", "WEAK_INFILL", "BLOBS_AND_ZITS", "GAPS_BETWEEN_INFILL_AND_PERIMETER", "CORNER_CURLING_AND_ROUGHNESS", "TOP_SURFACE_SCARRING", "CORNER_GAPS_IN_BOTTOM_LAYER", "LAYER_LINES_ON_SIDES", "VIBRATION_AND_RINGING", "THIN_WALL_GAPS", "SMALL_FEATURE_LOSS", "INCONSISTENT_EXTRUSION", "WARPING", "POOR_OVERHANG_QUALITY", "DIMENSIONAL_INACCURACY", "POOR_BRIDGING", "FILAMENT_FEEDING", "FILAMENT_RAN_OUT", "NOT_A_CLUE"]);
// #endregion

// #region printing::printer_status::FailureReason
export const printer_statusSchema = z.enum(["MAIN_CONTROLLER_BOARD", "POWER_SUPPLY", "DISPLAY_BOARD", "WIFI_MODULE", "HOTEND_THERMISTOR", "HEATBED_THERMISTOR", "HOTEND_HEATER_CARTRIDGE", "HEATBED_HEATING_ELEMENT", "HEATER_BLOCK", "EXTRUDER_MOTOR", "X_AXIS_MOTOR", "Y_AXIS_MOTOR", "Z_AXIS_MOTOR", "LINEAR_RAILS", "LINEAR_BEARINGS", "BELT_SYSTEM", "PULLEYS", "LEAD_SCREW_NUT", "HOTEND_FAN", "PART_COOLING_FAN", "CHAMBER_FAN", "POWER_SUPPLY_FAN", "NOZZLE", "HEAT_BREAK", "HEAT_SINK", "EXTRUDER_GEARS", "BOWDEN_TUBE", "FILAMENT_SENSOR", "BED_LEVELING_SENSOR", "DOOR_SENSOR", "CRASH_DETECTION_SENSOR", "POWER_PANIC_SENSOR", "PRINT_BED_SURFACE", "BED_LEVELLING_SPRINGS", "BED_MOUNTING_HARDWARE", "HOTEND_WIRING", "HEATBED_WIRING", "MOTOR_WIRING", "MAIN_POWER_CABLE", "USB_CONNECTION", "FRAME_COMPONENTS", "SMOOTH_RODS", "ENCLOSURE_PANELS", "FILAMENT_FEEDING"]);
// #endregion

// #region printing::Type
export const TypeSchema = z.enum(["PLA", "TPU", "PETG", "RESIN"]);
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

// #region printing::Print
export const CreatePrintSchema = z.
  object({
    duration: zt.duration(), // std::duration
    mass: z.number().min(-3.40282347e+38).max(3.40282347e+38), // std::float32
    name: z.string(), // std::str
    type: z.enum(["PLA", "TPU", "PETG", "RESIN"]), // printing::Type
  });

export const UpdatePrintSchema = z.
  object({
    duration: zt.duration(), // std::duration
    mass: z.number().min(-3.40282347e+38).max(3.40282347e+38), // std::float32
    name: z.string(), // std::str
    type: z.enum(["PLA", "TPU", "PETG", "RESIN"]), // printing::Type
  });
// #endregion

// #region printing::print_status::Cancelled
export const Createprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Cancelled
  });

export const Updateprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Cancelled
  });
// #endregion

// #region printing::print_status::Complete
export const Createprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Complete
  });

export const Updateprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Complete
  });
// #endregion

// #region printing::print_status::Failed
export const Createprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Failed
    note: z.string().nullable(), // std::str
    reason: z.enum(["NO_EXTRUSION_AT_PRINT_START", "POOR_BED_ADHESION", "UNDER_EXTRUSION", "OVER_EXTRUSION", "GAPS_IN_TOP_LAYERS", "STRINGING_AND_OOZING", "OVERHEATING", "LAYER_SHIFTING", "LAYER_SEPARATION_AND_SPLITTING", "FILAMENT_GRINDING", "EXTRUDER_CLOG", "EXTRUSION_STOPS_MID_PRINT", "WEAK_INFILL", "BLOBS_AND_ZITS", "GAPS_BETWEEN_INFILL_AND_PERIMETER", "CORNER_CURLING_AND_ROUGHNESS", "TOP_SURFACE_SCARRING", "CORNER_GAPS_IN_BOTTOM_LAYER", "LAYER_LINES_ON_SIDES", "VIBRATION_AND_RINGING", "THIN_WALL_GAPS", "SMALL_FEATURE_LOSS", "INCONSISTENT_EXTRUSION", "WARPING", "POOR_OVERHANG_QUALITY", "DIMENSIONAL_INACCURACY", "POOR_BRIDGING", "FILAMENT_FEEDING", "FILAMENT_RAN_OUT", "NOT_A_CLUE"]), // printing::print_status::FailureReason
  });

export const Updateprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Failed
    note: z.string().nullable(), // std::str
    reason: z.enum(["NO_EXTRUSION_AT_PRINT_START", "POOR_BED_ADHESION", "UNDER_EXTRUSION", "OVER_EXTRUSION", "GAPS_IN_TOP_LAYERS", "STRINGING_AND_OOZING", "OVERHEATING", "LAYER_SHIFTING", "LAYER_SEPARATION_AND_SPLITTING", "FILAMENT_GRINDING", "EXTRUDER_CLOG", "EXTRUSION_STOPS_MID_PRINT", "WEAK_INFILL", "BLOBS_AND_ZITS", "GAPS_BETWEEN_INFILL_AND_PERIMETER", "CORNER_CURLING_AND_ROUGHNESS", "TOP_SURFACE_SCARRING", "CORNER_GAPS_IN_BOTTOM_LAYER", "LAYER_LINES_ON_SIDES", "VIBRATION_AND_RINGING", "THIN_WALL_GAPS", "SMALL_FEATURE_LOSS", "INCONSISTENT_EXTRUSION", "WARPING", "POOR_OVERHANG_QUALITY", "DIMENSIONAL_INACCURACY", "POOR_BRIDGING", "FILAMENT_FEEDING", "FILAMENT_RAN_OUT", "NOT_A_CLUE"]), // printing::print_status::FailureReason
  });
// #endregion

// #region printing::print_status::Printing
export const Createprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Printing
  });

export const Updateprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Printing
  });
// #endregion

// #region printing::print_status::Queued
export const Createprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Queued
  });

export const Updateprint_statusSchema = z.
  object({ // printing::PrintStatus
  })
  .extend({ // printing::print_status::Queued
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
    name: z.string(), // std::str
    remote_ip: z.string(), // std::str
    type: z.enum(["PLA", "TPU", "PETG", "RESIN"]), // printing::Type
  });

export const UpdatePrinterSchema = z.
  object({
    name: z.string(), // std::str
    remote_ip: z.string(), // std::str
    type: z.enum(["PLA", "TPU", "PETG", "RESIN"]), // printing::Type
  });
// #endregion

// #region printing::printer_status::Disabled
export const Createprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Disabled
  });

export const Updateprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Disabled
  });
// #endregion

// #region printing::printer_status::Disconnected
export const Createprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Disconnected
  });

export const Updateprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Disconnected
  });
// #endregion

// #region printing::printer_status::Failed
export const Createprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Failed
    note: z.string(), // std::str
    reason: z.enum(["MAIN_CONTROLLER_BOARD", "POWER_SUPPLY", "DISPLAY_BOARD", "WIFI_MODULE", "HOTEND_THERMISTOR", "HEATBED_THERMISTOR", "HOTEND_HEATER_CARTRIDGE", "HEATBED_HEATING_ELEMENT", "HEATER_BLOCK", "EXTRUDER_MOTOR", "X_AXIS_MOTOR", "Y_AXIS_MOTOR", "Z_AXIS_MOTOR", "LINEAR_RAILS", "LINEAR_BEARINGS", "BELT_SYSTEM", "PULLEYS", "LEAD_SCREW_NUT", "HOTEND_FAN", "PART_COOLING_FAN", "CHAMBER_FAN", "POWER_SUPPLY_FAN", "NOZZLE", "HEAT_BREAK", "HEAT_SINK", "EXTRUDER_GEARS", "BOWDEN_TUBE", "FILAMENT_SENSOR", "BED_LEVELING_SENSOR", "DOOR_SENSOR", "CRASH_DETECTION_SENSOR", "POWER_PANIC_SENSOR", "PRINT_BED_SURFACE", "BED_LEVELLING_SPRINGS", "BED_MOUNTING_HARDWARE", "HOTEND_WIRING", "HEATBED_WIRING", "MOTOR_WIRING", "MAIN_POWER_CABLE", "USB_CONNECTION", "FRAME_COMPONENTS", "SMOOTH_RODS", "ENCLOSURE_PANELS", "FILAMENT_FEEDING"]), // printing::printer_status::FailureReason
  });

export const Updateprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Failed
    note: z.string(), // std::str
    reason: z.enum(["MAIN_CONTROLLER_BOARD", "POWER_SUPPLY", "DISPLAY_BOARD", "WIFI_MODULE", "HOTEND_THERMISTOR", "HEATBED_THERMISTOR", "HOTEND_HEATER_CARTRIDGE", "HEATBED_HEATING_ELEMENT", "HEATER_BLOCK", "EXTRUDER_MOTOR", "X_AXIS_MOTOR", "Y_AXIS_MOTOR", "Z_AXIS_MOTOR", "LINEAR_RAILS", "LINEAR_BEARINGS", "BELT_SYSTEM", "PULLEYS", "LEAD_SCREW_NUT", "HOTEND_FAN", "PART_COOLING_FAN", "CHAMBER_FAN", "POWER_SUPPLY_FAN", "NOZZLE", "HEAT_BREAK", "HEAT_SINK", "EXTRUDER_GEARS", "BOWDEN_TUBE", "FILAMENT_SENSOR", "BED_LEVELING_SENSOR", "DOOR_SENSOR", "CRASH_DETECTION_SENSOR", "POWER_PANIC_SENSOR", "PRINT_BED_SURFACE", "BED_LEVELLING_SPRINGS", "BED_MOUNTING_HARDWARE", "HOTEND_WIRING", "HEATBED_WIRING", "MOTOR_WIRING", "MAIN_POWER_CABLE", "USB_CONNECTION", "FRAME_COMPONENTS", "SMOOTH_RODS", "ENCLOSURE_PANELS", "FILAMENT_FEEDING"]), // printing::printer_status::FailureReason
  });
// #endregion

// #region printing::printer_status::Idle
export const Createprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Idle
  });

export const Updateprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Idle
  });
// #endregion

// #region printing::printer_status::Printing
export const Createprinter_statusSchema = z.
  object({ // printing::PrinterStatus
  })
  .extend({ // printing::printer_status::Printing
  });

export const Updateprinter_statusSchema = z.
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
  });

export const UpdatePrintHistorySchema = z.
  object({ // default::CreatedAt
  })
  .extend({ // printing::PrintHistory
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
