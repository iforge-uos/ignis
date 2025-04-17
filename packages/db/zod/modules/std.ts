import { Temporal } from "@js-temporal/polyfill";
import { Duration } from "gel";
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
export const datetimeSchema = z.union([z.instanceof(Temporal.ZonedDateTime), z.date().transform((dt) => new Temporal.ZonedDateTime(BigInt(dt.getTime() * 1000), "UTC")), (z.iso.datetime({ offset: true }).transform((dt) => Temporal.ZonedDateTime.from(dt)))]);
// #endregion

// #region std::duration
export const durationSchema = z.union([z.instanceof(Temporal.Duration), z.instanceof(Duration).transform(Temporal.Duration.from), (z.iso.duration().transform((dur) => Temporal.Duration.from(dur)))]);
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
export const uuidSchema = z.uuid();
// #endregion

        