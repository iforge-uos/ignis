CREATE MIGRATION m1urhrdqrurxyuydqizgvmcivqb35zdagy3ltmi37pkmj6abz65eaa
    ONTO initial
{
  CREATE EXTENSION pgcrypto VERSION '1.3';
  CREATE EXTENSION auth VERSION '1.0';
  CREATE EXTENSION pg_trgm VERSION '1.6';
  CREATE MODULE event IF NOT EXISTS;
  CREATE MODULE notification IF NOT EXISTS;
  CREATE MODULE sign_in IF NOT EXISTS;
  CREATE MODULE team IF NOT EXISTS;
  CREATE MODULE training IF NOT EXISTS;
  CREATE MODULE users IF NOT EXISTS;
  CREATE ABSTRACT TYPE default::CreatedAt {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
  };
  CREATE ABSTRACT TYPE default::Auditable EXTENDING default::CreatedAt {
      CREATE REQUIRED PROPERTY updated_at: std::datetime {
          SET default := (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  CREATE ABSTRACT LINK default::timed {
      CREATE PROPERTY ends_at: std::datetime;
      CREATE PROPERTY created_at: std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
  };
  CREATE TYPE users::Role {
      CREATE REQUIRED PROPERTY name: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE users::User EXTENDING default::Auditable {
      CREATE REQUIRED LINK identity: ext::auth::Identity;
      CREATE MULTI LINK referrals: users::User {
          CREATE PROPERTY created_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
      };
      CREATE MULTI LINK roles: users::Role;
      CREATE REQUIRED PROPERTY first_name: std::str;
      CREATE PROPERTY last_name: std::str;
      CREATE REQUIRED PROPERTY display_name: std::str {
          SET default := ((std::str_trim(((.first_name ++ ' ') ++ .last_name)) IF (.last_name ?!= '') ELSE .first_name));
      };
      CREATE REQUIRED PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
          CREATE CONSTRAINT std::regexp(r'[\w\-\.]+');
          CREATE REWRITE
              INSERT 
              USING (std::str_lower(.email));
          CREATE REWRITE
              UPDATE 
              USING (std::str_lower(.email));
      };
      CREATE REQUIRED PROPERTY organisational_unit: std::str {
          CREATE ANNOTATION std::description := "The user's school/faculty e.g. Music or IPE";
      };
      CREATE PROPERTY profile_picture: std::str {
          CREATE ANNOTATION std::description := "The user's profile picture from their google account";
      };
      CREATE PROPERTY pronouns: std::str;
      CREATE REQUIRED PROPERTY ucard_number: std::int32 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY username: std::str {
          CREATE CONSTRAINT std::exclusive;
          CREATE ANNOTATION std::description := "The user's university login.";
      };
  };
  CREATE GLOBAL default::user := (std::assert_single((SELECT
      users::User
  FILTER
      (.identity = GLOBAL ext::auth::ClientTokenIdentity)
  )));
  CREATE SCALAR TYPE users::RepStatus EXTENDING enum<ACTIVE, BREAK, ALUMNI, FUTURE, REMOVED>;
  CREATE TYPE team::Team {
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY tag: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE ABSTRACT TYPE training::Interactable {
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE REQUIRED PROPERTY enabled: std::bool {
          SET default := true;
      };
      CREATE REQUIRED PROPERTY index: std::int16;
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
  };
  CREATE TYPE training::TrainingPage EXTENDING training::Interactable {
      CREATE PROPERTY duration: std::duration;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  CREATE SCALAR TYPE event::EventType EXTENDING enum<WORKSHOP, LECTURE, MEETUP, HACKATHON, EXHIBITION, WEBINAR>;
  CREATE TYPE event::Event EXTENDING default::CreatedAt {
      CREATE REQUIRED MULTI LINK attendees: users::User {
          CREATE PROPERTY registered_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
      };
      CREATE REQUIRED LINK organiser: users::User;
      CREATE PROPERTY description: std::str;
      CREATE PROPERTY ends_at: std::datetime;
      CREATE REQUIRED PROPERTY starts_at: std::datetime;
      CREATE REQUIRED PROPERTY title: std::str;
      CREATE REQUIRED PROPERTY type: event::EventType;
  };
  CREATE TYPE notification::AllTarget {
      CREATE REQUIRED PROPERTY target: std::str {
          CREATE CONSTRAINT std::one_of('ALL', 'REPS');
      };
  };
  CREATE TYPE users::Rep EXTENDING users::User {
      CREATE REQUIRED MULTI LINK teams: team::Team {
          EXTENDING default::timed;
      };
      CREATE REQUIRED PROPERTY status: users::RepStatus {
          SET default := (users::RepStatus.ACTIVE);
      };
  };
  CREATE ALIAS training::Page := (
      training::TrainingPage
  );
  CREATE SCALAR TYPE notification::DeliveryMethod EXTENDING enum<BANNER, EMAIL, TRAY, POPUP, DISCORD>;
  CREATE SCALAR TYPE notification::Status EXTENDING enum<DRAFT, REVIEW, QUEUED, SENDING, SENT, ERRORED>;
  CREATE SCALAR TYPE notification::Type EXTENDING enum<ADMIN, ADVERT, ANNOUNCEMENT, EVENT, HEALTH_AND_SAFETY, INFRACTION, PRINTING, QUEUE_SLOT_ACTIVE, RECRUITMENT, REFERRAL, REMINDER, TRAINING>;
  CREATE SCALAR TYPE sign_in::LocationName EXTENDING enum<MAINSPACE, HEARTSPACE>;
  CREATE SCALAR TYPE sign_in::LocationStatus EXTENDING enum<OPEN, SOON, CLOSED>;
  CREATE SCALAR TYPE sign_in::ReasonCategory EXTENDING enum<UNIVERSITY_MODULE, CO_CURRICULAR_GROUP, PERSONAL_PROJECT, SOCIETY, REP_SIGN_IN, EVENT>;
  CREATE SCALAR TYPE training::AnswerType EXTENDING enum<`SINGLE`, MULTI>;
  CREATE SCALAR TYPE training::LocationName EXTENDING enum<MAINSPACE, HEARTSPACE, GEORGE_PORTER>;
  CREATE SCALAR TYPE training::Selectability EXTENDING enum<NO_TRAINING, REVOKED, EXPIRED, REPS_UNTRAINED, IN_PERSON_MISSING>;
  CREATE SCALAR TYPE users::InfractionType EXTENDING enum<WARNING, TEMP_BAN, PERM_BAN, RESTRICTION, TRAINING_ISSUE>;
  CREATE SCALAR TYPE users::Platform EXTENDING enum<DISCORD, GITHUB>;
  CREATE GLOBAL default::INFRACTIONS_WEBHOOK_URL -> std::str;
  CREATE TYPE sign_in::Agreement EXTENDING default::Auditable {
      CREATE ACCESS POLICY admin_only
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update agreements';
          };
      CREATE REQUIRED PROPERTY content: std::str {
          CREATE ANNOTATION std::description := 'The content of the markdown file that are served to the user.';
      };
      CREATE REQUIRED PROPERTY _content_hash: std::bytes {
          SET default := (ext::pgcrypto::digest(.content, 'sha256'));
          CREATE REWRITE
              UPDATE 
              USING (ext::pgcrypto::digest(.content, 'sha256'));
      };
      CREATE REQUIRED PROPERTY version: std::int16 {
          SET default := 1;
          CREATE REWRITE
              UPDATE 
              USING (((.version + 1) IF (__subject__.content != __old__.content) ELSE .version));
      };
      CREATE CONSTRAINT std::exclusive ON ((.version, ._content_hash));
      CREATE REQUIRED PROPERTY name: std::str;
  };
  CREATE TYPE sign_in::Reason EXTENDING default::CreatedAt {
      CREATE REQUIRED PROPERTY name: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update reasons';
          };
      CREATE LINK agreement: sign_in::Agreement;
      CREATE INDEX ON (.name);
      CREATE REQUIRED PROPERTY category: sign_in::ReasonCategory;
  };
  CREATE TYPE sign_in::Location EXTENDING default::Auditable {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update location info';
          };
      CREATE REQUIRED PROPERTY closing_time: std::cal::local_time;
      CREATE MULTI PROPERTY opening_days: std::int16 {
          CREATE ANNOTATION std::description := '1-7, the days of the week we are currently open, Monday (1) to Sunday (7)';
      };
      CREATE REQUIRED PROPERTY opening_time: std::cal::local_time;
      CREATE REQUIRED PROPERTY out_of_hours := (WITH
          current_time := 
              (SELECT
                  std::cal::to_local_time(std::datetime_of_statement(), 'Europe/London')
              )
      SELECT
          NOT ((((.opening_time <= current_time) AND (current_time <= .closing_time)) AND (<std::int16>std::datetime_get(std::datetime_of_statement(), 'isodow') IN .opening_days)))
      );
      CREATE REQUIRED PROPERTY name: sign_in::LocationName {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY in_of_hours_rep_multiplier: std::int16;
      CREATE REQUIRED PROPERTY max_users: std::int16;
      CREATE REQUIRED PROPERTY out_of_hours_rep_multiplier: std::int16;
      CREATE REQUIRED PROPERTY queue_enabled: std::bool {
          SET default := true;
          CREATE ANNOTATION std::description := 'Manually disable the queue.';
      };
  };
  CREATE TYPE sign_in::QueuePlace EXTENDING default::CreatedAt {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
      CREATE REQUIRED LINK user: users::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE ACCESS POLICY edit_self
          ALLOW ALL USING ((GLOBAL default::user ?= .user)) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE PROPERTY notified_at: std::datetime {
          CREATE ANNOTATION std::description := 'The time the user was emailed that they have a slot.';
      };
      CREATE PROPERTY ends_at := ((.notified_at + <std::cal::relative_duration>'20m'));
  };
  CREATE ABSTRACT TYPE default::Timed EXTENDING default::CreatedAt {
      CREATE PROPERTY ends_at: std::datetime;
      CREATE REQUIRED PROPERTY duration := (std::assert_exists(((.ends_at - .created_at) IF EXISTS (.ends_at) ELSE (std::datetime_of_transaction() - .created_at))));
  };
  CREATE TYPE sign_in::SignIn EXTENDING default::Timed {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can operate on all sign-ins';
          };
      CREATE REQUIRED LINK user: users::User;
      CREATE ACCESS POLICY view_self
          ALLOW SELECT USING ((GLOBAL default::user ?= .user)) {
              SET errmessage := 'Can only view your own sign-ins';
          };
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED PROPERTY signed_out := (SELECT
          EXISTS (.ends_at)
      );
      CREATE REQUIRED LINK reason: sign_in::Reason;
      CREATE CONSTRAINT std::exclusive ON (.user) EXCEPT (.signed_out);
      CREATE REQUIRED PROPERTY tools: array<std::str>;
  };
  CREATE TYPE sign_in::UserRegistration EXTENDING default::CreatedAt {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED LINK user: users::User {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE training::Answer {
      CREATE ACCESS POLICY h_and_s_or_higher
          ALLOW ALL USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              ((EXISTS (({'Admin'} INTERSECT user.roles.name)) OR ((user IS users::Rep) AND EXISTS (({'H&S'} INTERSECT user[IS users::Rep].teams.name)))) ?? false)
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE REQUIRED PROPERTY correct: std::bool {
          SET default := false;
      };
      CREATE PROPERTY description: std::str {
          CREATE ANNOTATION std::description := "The text shown after a user passes their answer giving a lil' explanation about whatever they said.";
      };
  };
  CREATE TYPE training::Training EXTENDING default::Auditable {
      CREATE LINK rep: training::Training {
          CREATE ANNOTATION std::description := 'The associated training that reps should have to supervise this. Empty if the training is for reps.';
      };
      CREATE ACCESS POLICY allow_reps_view_rep
          DENY ALL USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              (((user IS NOT users::Rep) AND NOT (EXISTS (.rep))) ?? false)
          ) {
              SET errmessage := 'Only reps can view rep training';
          };
      CREATE ACCESS POLICY desk_or_higher_edit
          ALLOW ALL USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              ((EXISTS (({'Admin'} INTERSECT user.roles.name)) OR ((user IS users::Rep) AND EXISTS (({'H&S'} INTERSECT user[IS users::Rep].teams.name)))) ?? false)
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
      CREATE REQUIRED PROPERTY in_person: std::bool {
          CREATE ANNOTATION std::description := 'Whether this training requires in person training.';
      };
      CREATE MULTI PROPERTY locations: training::LocationName;
      CREATE MULTI LINK pages: training::TrainingPage;
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE CONSTRAINT std::exclusive ON ((.name, .rep));
      CREATE INDEX fts::index ON (std::fts::with_options(.name, language := std::fts::Language.eng));
      CREATE REQUIRED PROPERTY compulsory: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY enabled: std::bool {
          SET default := true;
      };
      CREATE PROPERTY expires_after: std::duration;
      CREATE PROPERTY icon_url: std::str;
      CREATE PROPERTY training_lockout: std::duration;
  };
  CREATE TYPE training::Session EXTENDING default::Auditable {
      CREATE REQUIRED LINK user: users::User;
      CREATE ACCESS POLICY allow_self
          ALLOW ALL USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              (EXISTS (({'Admin'} INTERSECT user.roles.name)) OR (user ?= .user))
          ) {
              SET errmessage := 'Only self/admins can view sessions';
          };
      CREATE REQUIRED LINK training: training::Training;
      CREATE CONSTRAINT std::exclusive ON ((.user, .training));
      CREATE REQUIRED PROPERTY index: std::int16 {
          SET default := 0;
          CREATE ANNOTATION std::description := 'The `Interactable.index` for the section user is currently on.';
      };
  };
  ALTER TYPE training::Interactable {
      CREATE ACCESS POLICY desk_or_higher_edit
          ALLOW ALL USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              ((EXISTS (({'Admin'} INTERSECT user.roles.name)) OR ((user IS users::Rep) AND EXISTS (({'H&S'} INTERSECT user[IS users::Rep].teams.name)))) ?? false)
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
      CREATE REQUIRED LINK parent: training::Training;
      CREATE CONSTRAINT std::exclusive ON ((.parent, .index));
  };
  CREATE TYPE training::Question EXTENDING training::Interactable {
      CREATE REQUIRED MULTI LINK answers: training::Answer;
      CREATE REQUIRED PROPERTY type: training::AnswerType;
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK training: training::Training {
          CREATE PROPERTY in_person_created_at: std::datetime;
          CREATE PROPERTY created_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
          CREATE PROPERTY in_person_signed_off_by: std::uuid;
          CREATE PROPERTY infraction: std::uuid;
      };
      CREATE ACCESS POLICY rep_or_higher
          ALLOW ALL USING (EXISTS (({'Rep', 'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := "Only reps can see everyone's profile";
          };
      CREATE ACCESS POLICY view_self
          ALLOW ALL USING ((GLOBAL default::user ?= __subject__)) {
              SET errmessage := 'Can only view your own profile';
          };
      CREATE MULTI LINK agreements_signed: sign_in::Agreement {
          CREATE PROPERTY created_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
      };
  };
  ALTER TYPE training::Training {
      CREATE ACCESS POLICY select_if_completed_basic
          ALLOW SELECT USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              (NOT (EXISTS (.rep)) AND (__subject__ IN user.training.rep))
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
      CREATE MULTI LINK questions: training::Question;
  };
  CREATE TYPE users::Infraction EXTENDING default::CreatedAt {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update infractions';
          };
      CREATE REQUIRED LINK user: users::User;
      CREATE PROPERTY duration: std::duration;
      CREATE PROPERTY ends_at := ((.created_at + .duration));
      CREATE REQUIRED PROPERTY reason: std::str;
      CREATE REQUIRED PROPERTY resolved: std::bool {
          SET default := false;
          CREATE ANNOTATION std::description := 'Whether the infraction has been resolved or is still active';
      };
      CREATE REQUIRED PROPERTY type: users::InfractionType;
  };
  ALTER TYPE users::Rep {
      CREATE MULTI LINK supervisable_training := (WITH
          current_training := 
              .training
      SELECT
          .training
      FILTER
          ((EXISTS (.rep) AND (.rep IN current_training)) AND (NOT (.in_person) OR EXISTS (@in_person_created_at)))
      );
  };
  ALTER TYPE sign_in::Location {
      CREATE MULTI LINK sign_ins := (SELECT
          .<location[IS sign_in::SignIn]
      FILTER
          NOT (.signed_out)
      );
      CREATE MULTI LINK off_shift_reps := (WITH
          rep_sign_ins := 
              (SELECT
                  .sign_ins
              FILTER
                  ((.user IS users::Rep) AND (.reason.name = 'Rep Off Shift'))
              )
      SELECT
          rep_sign_ins.user[IS users::Rep]
      );
      CREATE MULTI LINK on_shift_reps := (WITH
          rep_sign_ins := 
              (SELECT
                  .sign_ins
              FILTER
                  ((.user IS users::Rep) AND (.reason.name = 'Rep On Shift'))
              )
      SELECT
          rep_sign_ins.user[IS users::Rep]
      );
      CREATE MULTI LINK supervising_reps := (SELECT
          ((.on_shift_reps UNION .off_shift_reps) IF .out_of_hours ELSE .on_shift_reps)
      );
      CREATE MULTI LINK supervisable_training := (SELECT
          DISTINCT (.supervising_reps.supervisable_training)
      FILTER
          (<training::LocationName><std::str>__source__.name IN .locations)
      );
      CREATE REQUIRED PROPERTY max_count := (SELECT
          std::min({((SELECT
              (.out_of_hours_rep_multiplier IF .out_of_hours ELSE .in_of_hours_rep_multiplier)
          ) * std::count(.supervising_reps)), .max_users})
      );
      CREATE REQUIRED PROPERTY can_sign_in := (SELECT
          ((std::count(.sign_ins) < .max_count) AND (((.max_count + std::count(.supervising_reps)) - std::count(.sign_ins)) >= 0))
      );
      CREATE MULTI LINK queued := (.<location[IS sign_in::QueuePlace]);
      CREATE REQUIRED PROPERTY queue_in_use := (SELECT
          ((std::assert(.queue_enabled, message := 'Queue has been manually disabled') AND EXISTS (.queued)) OR NOT (.can_sign_in))
      );
      CREATE REQUIRED PROPERTY status := (WITH
          current_time := 
              (SELECT
                  std::cal::to_local_time(std::datetime_of_statement(), 'Europe/London')
              )
      SELECT
          (sign_in::LocationStatus.OPEN IF (std::count(.on_shift_reps) > 0) ELSE (sign_in::LocationStatus.SOON IF ((((.opening_time - <std::cal::relative_duration>'30m') <= current_time) AND (current_time <= (.closing_time - <std::cal::relative_duration>'30m'))) AND (std::datetime_get(std::datetime_of_statement(), 'isodow') IN .opening_days)) ELSE sign_in::LocationStatus.CLOSED))
      );
      CREATE MULTI LINK queued_users_that_can_sign_in := (SELECT
          ((SELECT
              .queued
          FILTER
              (.ends_at >= std::datetime_of_statement())
          )).user
      );
  };
  ALTER TYPE sign_in::Agreement {
      CREATE MULTI LINK reasons := (.<agreement[IS sign_in::Reason]);
  };
  ALTER TYPE sign_in::QueuePlace {
      CREATE TRIGGER prohibit_queue
          AFTER INSERT 
          FOR EACH DO (SELECT
              std::assert(__new__.location.queue_in_use, message := 'Queue has been manually disabled')
          );
  };
  ALTER TYPE training::Training {
      CREATE MULTI LINK sections := (SELECT
          (.pages UNION .questions)
      ORDER BY
          .index ASC
      );
  };
  CREATE TYPE notification::Notification EXTENDING default::Auditable {
      CREATE REQUIRED PROPERTY content: std::str {
          CREATE ANNOTATION std::description := 'The content (MARKDOWN) from plate';
      };
      CREATE REQUIRED MULTI PROPERTY delivery_method: notification::DeliveryMethod;
      CREATE REQUIRED PROPERTY dispatched_at: std::datetime {
          SET default := (std::datetime_of_statement());
          CREATE ANNOTATION std::description := "When the notification started rolling out or if it's scheduled when it will be dispatched";
      };
      CREATE REQUIRED PROPERTY priority: std::int16 {
          SET default := 0;
          CREATE ANNOTATION std::description := '\n                The priority of the notification, defaults to zero. The higher the number the higher the priority. If\n                there are two notifications trying to be used at the same time the higher priority one will take over.\n                Otherwise the newer one prevails\n            ';
      };
      CREATE REQUIRED PROPERTY status: notification::Status;
      CREATE REQUIRED PROPERTY title: std::str {
          CREATE ANNOTATION std::description := 'The heading of the rendered notification (web) or the subject of the rendered email';
      };
      CREATE REQUIRED PROPERTY type: notification::Type;
  };
  CREATE TYPE notification::AuthoredNotification EXTENDING notification::Notification {
      CREATE LINK approved_by: users::Rep;
      CREATE REQUIRED LINK author: users::User;
      CREATE PROPERTY approved_on: std::datetime;
  };
  CREATE TYPE notification::MailingList EXTENDING default::Auditable {
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE notification::Notification {
      CREATE REQUIRED MULTI LINK target: ((((users::User | team::Team) | notification::MailingList) | notification::AllTarget) | event::Event);
  };
  CREATE TYPE notification::SystemNotification EXTENDING notification::Notification {
      CREATE REQUIRED PROPERTY source: std::str {
          CREATE ANNOTATION std::description := 'The name of the service / module which caused this notification';
      };
  };
  CREATE TYPE users::Integration EXTENDING default::Auditable {
      CREATE REQUIRED PROPERTY external_id: std::str;
      CREATE REQUIRED PROPERTY platform: users::Platform;
      CREATE CONSTRAINT std::exclusive ON ((.platform, .external_id));
      CREATE REQUIRED LINK user: users::User;
      CREATE CONSTRAINT std::exclusive ON ((.platform, .user));
      CREATE INDEX ON ((.platform, .external_id));
      CREATE INDEX ON ((.platform, .user));
      CREATE REQUIRED PROPERTY external_email: std::str;
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK infractions: users::Infraction;
      CREATE MULTI LINK mailing_list_subscriptions: notification::MailingList;
      CREATE MULTI LINK notifications: notification::Notification {
          CREATE PROPERTY acknowledged: std::datetime {
              CREATE ANNOTATION std::description := 'Time the user has dismissed / marked as read / interacted with it (will be true if noti type is email & is delivered) otherwise empty';
          };
      };
  };
  ALTER TYPE notification::MailingList {
      CREATE MULTI LINK subscribers := (.<mailing_list_subscriptions[IS users::User]);
  };
  ALTER TYPE team::Team {
      CREATE MULTI LINK all_members := (.<teams[IS users::Rep]);
      CREATE MULTI LINK members := (SELECT
          .all_members
      FILTER
          ((.status = users::RepStatus.ACTIVE) AND (SELECT
              NOT (EXISTS ((SELECT
                  __source__.all_members.teams@ends_at
              FILTER
                  (__source__.all_members.teams.id = __source__.id)
              )))
          ))
      );
  };
  CREATE TYPE users::SettingTemplate {
      CREATE REQUIRED PROPERTY key: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.key);
      CREATE REQUIRED PROPERTY default_value: std::str;
  };
  CREATE TYPE users::UserSettingValue {
      CREATE REQUIRED LINK template: users::SettingTemplate;
      CREATE REQUIRED LINK user: users::User;
      CREATE INDEX ON ((.user, .template));
      CREATE ANNOTATION std::description := "A user's specific preference. Should only be inserted if not same as default";
      CREATE REQUIRED PROPERTY value: std::str;
  };
};
