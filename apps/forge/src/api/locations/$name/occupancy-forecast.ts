import { Temporal } from "@js-temporal/polyfill";
import e from "@packages/db/edgeql-js";
import { LocationNameSchema } from "@packages/db/zod/modules/sign_in";
import * as z from "zod";
import { pub } from "@/orpc";

const inputSchema = z.object({ name: LocationNameSchema });
const REPORTING_TIMEZONE = "Europe/London";
const FIRST_SIGN_IN_DATE = Temporal.PlainDate.from("2024-04-14");

export const occupancyForecast = pub
  .input(inputSchema)
  .route({ method: "GET", path: "/occupancy-forecast" })
  .handler(async ({ input: { name }, context: { db } }) => {
    const location = await e
      .assert_exists(
        e.select(e.sign_in.Location, () => ({
          filter_single: { name },
          max_count: true,
          opening_days: true,
          opening_time: true,
          closing_time: true,
        })),
      )
      .run(db);

    const now = Temporal.Now.zonedDateTimeISO(REPORTING_TIMEZONE);
    const dayStart = now.with({ hour: 0, minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
    const dayEnd = dayStart.add({ days: 1 });
    const todayDate = dayStart.toPlainDate();
    const todayIsoWeekday = todayDate.dayOfWeek;

    if (!location.opening_days.includes(todayIsoWeekday)) {
      return [];
    }

    const openingTime = Temporal.PlainTime.from(location.opening_time);
    const closingTime = Temporal.PlainTime.from(location.closing_time);

    const historicalWeekdayKeys = new Set<string>();
    for (let year = todayDate.year - 1; year >= FIRST_SIGN_IN_DATE.year; year -= 1) {
      const anchor = todayDate.with({ year }, { overflow: "constrain" });

      const daysForward = (todayDate.dayOfWeek - anchor.dayOfWeek + 7) % 7;
      const daysBackward = (anchor.dayOfWeek - todayDate.dayOfWeek + 7) % 7;

      const forwardCandidate = anchor.add({ days: daysForward });
      const backwardCandidate = anchor.subtract({ days: daysBackward });

      const sameYearForward = forwardCandidate.year === year;
      const sameYearBackward = backwardCandidate.year === year;

      const chosen =
        sameYearForward && sameYearBackward
          ? daysBackward <= daysForward
            ? backwardCandidate
            : forwardCandidate
          : sameYearBackward
            ? backwardCandidate
            : forwardCandidate;

      if (
        Temporal.PlainDate.compare(chosen, FIRST_SIGN_IN_DATE) >= 0 &&
        Temporal.PlainDate.compare(chosen, todayDate) < 0
      ) {
        historicalWeekdayKeys.add(chosen.toString());
      }
    }

    const getHourlyChunks = (rangeStart: Temporal.ZonedDateTime, rangeEnd: Temporal.ZonedDateTime) =>
      e
        .select(
          e.group(
            e.select(e.sign_in.SignIn, (signIn) => ({
              filter: e.all(
                e.set(
                  e.op(signIn.location.name, "=", e.cast(e.sign_in.LocationName, name)),
                  e.op(signIn.created_at, ">=", e.cast(e.datetime, rangeStart.toInstant().toString())),
                  e.op(signIn.created_at, "<", e.cast(e.datetime, rangeEnd.toInstant().toString())),
                ),
              ),
            })),
            (signIn) => ({
              by: {
                chunk: e.datetime_truncate(signIn.created_at, "hours"),
              },
            }),
          ),
          (group) => ({
            hour: e.datetime_get(group.key.chunk, "hour"),
            count: e.count(group.elements),
          }),
        )
        .run(db);

    const getHistoricHourlyChunks = (beforeDate: Temporal.ZonedDateTime) =>
      e
        .select(
          e.group(
            e.select(e.sign_in.SignIn, (signIn) => ({
              filter: e.all(
                e.set(
                  e.op(signIn.location.name, "=", e.cast(e.sign_in.LocationName, name)),
                  e.op(signIn.created_at, "<", e.cast(e.datetime, beforeDate.toInstant().toString())),
                ),
              ),
            })),
            (signIn) => ({
              by: {
                dayKey: e.to_str(e.datetime_truncate(signIn.created_at, "days"), "YYYY-MM-DD"),
                hour: e.datetime_get(signIn.created_at, "hour"),
              },
            }),
          ),
          (group) => ({
            dayKey: group.key.dayKey,
            hour: group.key.hour,
            count: e.count(group.elements),
          }),
        )
        .run(db);

    const [currentChunks, historicChunks] = await Promise.all([
      getHourlyChunks(dayStart, dayEnd),
      getHistoricHourlyChunks(dayStart),
    ]);

    const currentByHour = new Map<number, number>(
      currentChunks
        .filter((chunk): chunk is { hour: number; count: number } => chunk.hour !== null)
        .map((chunk) => [chunk.hour, chunk.count]),
    );

    const sameWeekdayHistoric = historicChunks.filter(
      (chunk) => chunk.dayKey !== null && historicalWeekdayKeys.has(chunk.dayKey),
    );
    const historicDayCount = historicalWeekdayKeys.size;

    const projectedByHour = new Map<number, number>();
    for (let hour = 0; hour < 24; hour += 1) {
      const sum = sameWeekdayHistoric.reduce((acc, chunk) => {
        if (chunk.hour !== hour) return acc;
        return acc + chunk.count;
      }, 0);

      const averaged = historicDayCount === 0 ? 0 : Math.round(sum / historicDayCount);
      projectedByHour.set(hour, averaged);
    }

    const capacity = location.max_count;

    const allBuckets = Array.from({ length: 24 }, (_, hour) => {
      const current = currentByHour.get(hour) ?? 0;
      const projected = projectedByHour.get(hour) ?? 0;

      return {
        label: `${hour.toString().padStart(2, "0")}:00`,
        current,
        projected,
        capacity,
        utilisation: capacity === 0 ? 0 : Math.round((current / capacity) * 100),
        projectedUtilisation: capacity === 0 ? 0 : Math.ceil((projected / capacity) * 100),
      };
    });

    return allBuckets.filter((bucket) => {
      const [hourText] = bucket.label.split(":");
      const hour = Number(hourText);
      const bucketStart = Temporal.PlainTime.from({ hour, minute: 0 });
      const bucketEnd = bucketStart.add({ hours: 1 });

      return (
        Temporal.PlainTime.compare(bucketEnd, openingTime) > 0 &&
        Temporal.PlainTime.compare(bucketStart, closingTime) < 0
      );
    });
  });
