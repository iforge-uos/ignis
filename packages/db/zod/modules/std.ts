import * as z from "zod/v4";
import * as zt from "zod-temporal";


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
export const datetimeSchema = zt.zonedDateTime();
// #endregion

// #region std::duration
export const durationSchema = zt.duration();
// #endregion

// #region std::float32
export const float32Schema = z.number().min(-3.40282347e+38).max(3.40282347e+38);
// #endregion

// #region std::int16
export const int16Schema = z.int().min(-32768).max(32767);
// #endregion

// #region std::int32
export const int32Schema = z.int().min(-2147483648).max(2147483647);
// #endregion

// #region std::int64
export const int64Schema = z.bigint().min(-9223372036854775808n).max(9223372036854775807n);
// #endregion

// #region std::str
export const strSchema = z.string();
// #endregion

// #region std::uuid
export const uuidSchema = z.uuid();
// #endregion
