/**
 * The counts {@link deriveLocationStatus} needs, as `LocationStatusShape` selects them.
 */
type DerivableCounts = {
  on_shift_rep_count: number;
  off_shift_rep_count: number;
  sign_in_count: number;
  out_of_hours: boolean;
  max_users: number;
  in_hours_rep_multiplier: number;
  out_of_hours_rep_multiplier: number;
};

export type Derived<T extends DerivableCounts> = Omit<
  T,
  "sign_in_count" | "max_users" | "in_hours_rep_multiplier" | "out_of_hours_rep_multiplier"
> & {
  user_count: number;
  max_count: number;
};

/**
 * Mirrors `sign_in::Location.max_count` and the old `user_count` subquery in TypeScript. Both are
 * arithmetic over counts the query already returns, but as Location computeds they each re-derived
 * the sign-in and rep sets from scratch, which dominated the cost of selecting a location's status.
 *
 * Keep in sync with Location.max_count in packages/db/sign_in.gel.
 */
export function deriveLocationStatus<T extends DerivableCounts>({
  sign_in_count,
  max_users,
  in_hours_rep_multiplier,
  out_of_hours_rep_multiplier,
  ...location
}: T): Derived<T> {
  const { on_shift_rep_count, off_shift_rep_count, out_of_hours } = location;
  // every sign-in belongs to an on-shift rep, an off-shift rep, or a plain user: reps are
  // partitioned by whether their reason is "Rep On Shift", so what's left over is the users
  const user_count = sign_in_count - on_shift_rep_count - off_shift_rep_count;
  const supervising_rep_count = out_of_hours ? on_shift_rep_count + off_shift_rep_count : on_shift_rep_count;
  const multiplier = out_of_hours ? out_of_hours_rep_multiplier : in_hours_rep_multiplier;
  const max_count = Math.min(multiplier * supervising_rep_count + (out_of_hours ? 0 : off_shift_rep_count), max_users);
  return { ...location, user_count, max_count } as Derived<T>;
}
