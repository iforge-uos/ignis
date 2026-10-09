import type { GetSignInToolsArgs, GetSignInToolsReturns } from "@packages/db/queries/getSignInTools.query";
import type { Executor } from "gel";

export type { GetSignInToolsArgs, GetSignInToolsReturns };

type Selectability = GetSignInToolsReturns[number]["selectable"][number];

/**
 * The tools themselves, with the two cheap selectability conditions. Everything training-related is
 * left to {@link TRAINING_STATUS_QUERY}.
 */
const TOOLS_QUERY = `\
with
    location := (
        select assert_exists(sign_in::Location filter .name = <sign_in::LocationName>$name)
    ),
    tools := (select tools::Tool filter location = .location and not .grouped),
    groups := (select tools::GroupedTool filter location = .location),
select (tools union groups) {
    id,
    name,
    description := [is tools::Tool].description ?? [is tools::GroupedTool].tools.description,
    compulsory := any(.training.compulsory),
    training_ids := .training.id,
    none_remaining := [is tools::Tool].quantity = 0,  # inventoried tools cannot be grouped
    broken := (
        if [is tools::Tool] is tools::Tool then
            [is tools::Tool].status.code = tools::Status.OUT_OF_ORDER
        else
            all([is tools::GroupedTool].tools.status.code = tools::Status.OUT_OF_ORDER)
    ),
}`;

/**
 * Who the user is, and what the location's reps can supervise. Cheap, and deliberately not merged
 * into the statuses query below.
 */
const CONTEXT_QUERY = `\
with user := <users::User><uuid>$id,
select {
    is_rep := user is users::Rep,
    supervisable_training := (
        select assert_exists(sign_in::Location filter .name = <sign_in::LocationName>$name)
    ).supervisable_training.id,
}`;

/**
 * An inlined copy of training::get_status (training.gel) — keep the two in sync, exactly as the
 * fused query in packages/db/queries/getSignInTools.edgeql also does.
 *
 * Two things matter here. It runs once per *training* rather than once per tool, where the fused
 * query repeats the work for every tool that requires the same training. And `lookups` is hoisted
 * into the outer `with`, so the LOOKUPS globals — which are built by string-parsing through
 * default::bin — are evaluated once per statement instead of once per training. Calling
 * training::get_status instead of inlining it costs 12-18s against a dev database, because Gel does
 * not inline the function and re-evaluates those globals for every training.
 */
const TRAINING_STATUS_QUERY = `\
with
    user := <users::User><uuid>$id,
    collapse := <optional bool>$collapse,
    is_rep := user is users::Rep,
    collapse_ := collapse and is_rep,  # collapse_ should always be false for users
    lookups := (global training::COLLAPSED_LOOKUPS if collapse_ else global training::LOOKUPS),
select (select training::Training filter .id in array_unpack(<array<uuid>>$training)) {
    id,
    next_step := (
        with
            t_id := .id,
            t_rep_id := .rep.id,
            is_user_training := exists .rep,
            training_in_person_needed := .in_person,
            rep_in_person_needed := (.rep.in_person ?? false),
            # stupid but you can't do training@created_at directly for some reason
            u := user { training filter .id = t_id },
            r := user { training filter .id = t_rep_id },
            training_online_done := exists u.training@created_at,
            training_in_person_done := exists u.training@in_person_created_at,
            # the presence of any revocation means they can't use it
            training_revoked := exists u.training@infraction,
            training_expired := false,
            rep_online := exists r.training@created_at,
            rep_in_person_done := exists r.training@in_person_created_at,
            rep_revoked := exists r.training@infraction,
            rep_expired := false,
            key := (
                select default::bin(
                    ("1" if training_in_person_needed else "0") ++
                    ("1" if rep_in_person_needed else "0") ++
                    ("1" if training_online_done else "0") ++
                    ("1" if training_in_person_done else "0") ++
                    ("1" if rep_online else "0") ++
                    ("1" if rep_in_person_done else "0") ++
                    ("1" if training_expired else "0") ++
                    ("1" if rep_expired else "0") ++
                    ("1" if training_revoked else "0") ++
                    ("1" if rep_revoked else "0")
                ) if collapse_
                else default::bin(
                    ("1" if training_in_person_needed else "0") ++
                    ("1" if training_online_done else "0") ++
                    ("1" if training_in_person_done else "0") ++
                    ("1" if training_expired else "0") ++
                    ("1" if training_revoked else "0")
                )
            ),
        select (
            if not collapse_ or is_user_training then (
                select lookups filter bit_and(key, .care) = .value
                order by .value desc  # more specific ones first
                limit 1
            ) else {}
        )
    ).next_step,
}`;

type ToolRow = {
  id: string;
  name: string;
  description: string[];
  compulsory: boolean;
  training_ids: string[];
  none_remaining: boolean | null;
  broken: boolean | null;
};

type ContextRow = {
  is_rep: boolean;
  supervisable_training: string[];
};

type StatusRow = { id: string; next_step: string | null };

/**
 * Drop-in replacement for the generated `getSignInTools`, which fused both of the above into one
 * statement. The outer set of {@link Selectability} values is assembled here in the same order the
 * original set constructor listed them, and — as there — a value can repeat when more than one of a
 * tool's trainings produces it.
 */
export async function getSignInTools(client: Executor, args: GetSignInToolsArgs): Promise<GetSignInToolsReturns> {
  // Sequential, not Promise.all: `client` is an Executor, and half the callers hand us the sign-in
  // flow's Transaction, which refuses to run two queries at once.
  const tools = await client.query<ToolRow>(TOOLS_QUERY, { name: args.name });
  const [context] = await client.query<ContextRow>(CONTEXT_QUERY, { name: args.name, id: args.id });
  const statuses = await client.query<StatusRow>(TRAINING_STATUS_QUERY, {
    id: args.id,
    collapse: args.collapse ?? null,
    // taken from the rows above rather than re-derived from the tools in EdgeQL, so the set of
    // trainings we ask about is exactly the set we are going to look up
    training: [...new Set(tools.flatMap((tool) => tool.training_ids))],
  });

  const nextSteps = new Map(statuses.map(({ id, next_step }) => [id, next_step]));
  const supervisable = new Set(context.supervisable_training);

  return tools.map(({ training_ids, none_remaining, broken, ...tool }) => {
    const selectable: Selectability[] = [];
    if (none_remaining) selectable.push("NONE_REMAINING");
    if (broken) selectable.push("TOOL_BROKEN");
    for (const training of training_ids) {
      const next_step = nextSteps.get(training);
      // get_status returns an empty set for a training it has no verdict on, and NONE means "usable"
      if (next_step && next_step !== "NONE") selectable.push(next_step as Selectability);
    }
    if (!context.is_rep) {
      // reps may sign in to machines even where no rep is trained to supervise them
      for (const training of training_ids) {
        if (!supervisable.has(training)) selectable.push("REPS_UNTRAINED");
      }
    }
    return { ...tool, selectable };
  });
}
