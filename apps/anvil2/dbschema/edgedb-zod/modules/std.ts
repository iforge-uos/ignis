import { z } from "zod";

// #region std::bool
export const boolSchema = z.boolean();
// #endregion

// #region std::datetime
export const datetimeSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?)?Z?$/);
// #endregion

// #region std::duration
export const durationSchema = z.never();
// #endregion

// #region std::int16
export const int16Schema = z.number().int().min(0).max(65535);
// #endregion

// #region std::int32
export const int32Schema = z.number().int().min(0).max(2147483647);
// #endregion

// #region std::int64
export const int64Schema = z.number().int().min(0);
// #endregion

// #region std::str
export const strSchema = z.string();
// #endregion

// #region std::uuid
export const uuidSchema = z.string().uuid();
// #endregion
