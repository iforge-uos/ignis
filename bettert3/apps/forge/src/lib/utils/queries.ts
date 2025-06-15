import e from "@packages/db/edgeql-js";

export const PartialUserShape = e.shape(e.users.User, () => ({
  // Fairly minimal, useful for templating
  id: true,
  pronouns: true,
  email: true,
  display_name: true,
  username: true,
  ucard_number: true,
  profile_picture: true,
  created_at: true,
  roles: { id: true, name: true },
}));

export const UserShape = e.shape(e.users.User, () => ({
  // TODO use double splat when it's available edgedb/edgedb-js#558
  ...e.users.User["*"],
  agreements_signed: {
    id: true,
    created_at: true,
    "@created_at": true,
    "@version_signed": true,
    version: true,
  },
  roles: { id: true, name: true },
  mailing_list_subscriptions: true,
}));

export const RepShape = e.shape(e.users.Rep, (rep) => ({
  ...UserShape(rep),
  status: true,
  teams: { id: true, name: true },
}));

export const InfractionShape = e.shape(e.users.Infraction, () => ({
  id: true,
  created_at: true,
  duration: true,
  reason: true,
  type: true,
  resolved: true,
}));

export const AgreementShape = e.shape(e.sign_in.Agreement, () => ({
  ...e.sign_in.Agreement["*"],
  reasons: e.sign_in.Reason["*"],
  _content_hash: false, // no one cares about this implementation detail
}));

export const LocationStatusShape = e.shape(e.sign_in.Location, (location) => ({
  on_shift_rep_count: e.count(location.on_shift_reps),
  off_shift_rep_count: e.count(location.off_shift_reps),
  user_count: e.count(location.sign_ins),
  max_count: true,
  queued_count: e.count(location.queued),
  out_of_hours: true,
  name: true,
  status: true,
  opening_time: true,
  closing_time: true,
  queue_in_use: true,
}));

export const TrainingShape = e.shape(e.training.Training, () => ({
  id: true,
  name: true,
  description: true,
  compulsory: true,
  in_person: true,
  locations: true,
  enabled: true,
  "@created_at": true,
  "@in_person_created_at": true,
  rep: true,
  icon_url: true,
  // "@expires": true,
}));

export const TrainingForLocationShape = e.shape(e.training.Training, () => ({
  id: true,
  name: true,
  description: true,
  compulsory: true,
  locations: true,
  created_at: true,
  updated_at: true,
  in_person: true,
  rep: {
    id: true,
    description: true,
  },
  icon_url: true,
  enabled: true,
  status: "Start" as const,
}));

export const QueuePlaceShape = e.shape(e.sign_in.QueuePlace, () => ({
  user: PartialUserShape,
  created_at: true,
  id: true,
  notified_at: true,
  ends_at: true,
  location: {
    name: true,
  },
}));

export const LocationParams = e.params({ name: e.sign_in.LocationName }, ({ name }) =>
  e.assert_exists(e.select(e.sign_in.Location, () => ({ filter_single: { name } }))),
);

export const TeamShape = e.shape(e.team.Team, () => ({
  name: true,
  description: true,
  id: true,
}));
