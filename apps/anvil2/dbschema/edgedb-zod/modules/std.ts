import { z } from "zod";

// #region std::bool
export const boolSchema = z.boolean();
// #endregion

// #region std::bytes
export const bytesSchema = z.never();
// #endregion

// #region std::cal::local_time
export const calSchema = z.never();
// #endregion

// #region std::datetime
export const datetimeSchema = z.string().datetime({ offset: true });
// #endregion

// #region std::duration
export const durationSchema = z.string().duration();
// #endregion

// #region std::int16
export const int16Schema = z.number().int().min(-32768).max(32767);
// #endregion

// #region std::int32
export const int32Schema = z.number().int().min(-2147483648).max(2147483647);
// #endregion

// #region std::int64
export const int64Schema = z.bigint().min(-9223372036854775808n).max(9223372036854775807n);
// #endregion

// #region std::str
export const strSchema = z.string();
// #endregion

// #region std::uuid
export const uuidSchema = z.string().uuid();
// #endregion
