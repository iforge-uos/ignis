CREATE MIGRATION m1emttdizak6jmuqczu5fu7o37xqjw7gjwjujrkvkt7quh7flbze6q
    ONTO initial
{
  CREATE EXTENSION pg_trgm VERSION '1.6';
  CREATE MODULE auth IF NOT EXISTS;
  CREATE MODULE event IF NOT EXISTS;
  CREATE MODULE notification IF NOT EXISTS;
  CREATE MODULE sign_in IF NOT EXISTS;
  CREATE MODULE team IF NOT EXISTS;
  CREATE MODULE training IF NOT EXISTS;
  CREATE MODULE users IF NOT EXISTS;
  CREATE ABSTRACT LINK default::timed {
      CREATE PROPERTY created_at: std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE PROPERTY ends_at: std::datetime;
  };
  CREATE SCALAR TYPE auth::PermissionAction EXTENDING enum<READ, `UPDATE`, `CREATE`, `DELETE`>;
  CREATE SCALAR TYPE auth::PermissionSubject EXTENDING enum<ALL, SELF, USER>;
  CREATE TYPE auth::Permission {
      CREATE REQUIRED PROPERTY action: auth::PermissionAction;
      CREATE REQUIRED PROPERTY subject: auth::PermissionSubject;
      CREATE INDEX ON ((.action, .subject));
  };
  CREATE TYPE auth::Role {
      CREATE MULTI LINK permissions: auth::Permission;
      CREATE REQUIRED PROPERTY name: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
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
  CREATE SCALAR TYPE users::RepStatus EXTENDING enum<ACTIVE, BREAK, ALUMNI, FUTURE, REMOVED>;
  CREATE TYPE team::Team {
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
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
  };
  CREATE TYPE training::Answer {
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE REQUIRED PROPERTY correct: std::bool {
          SET default := false;
      };
      CREATE PROPERTY description: std::str {
          CREATE ANNOTATION std::description := "The text shown after a user passes their answer giving a lil' explaination about whatever they said.";
      };
  };
  CREATE SCALAR TYPE training::AnswerType EXTENDING enum<`SINGLE`, MULTI>;
  CREATE TYPE training::Question EXTENDING training::Interactable {
      CREATE REQUIRED MULTI LINK answers: training::Answer;
      CREATE REQUIRED PROPERTY type: training::AnswerType;
  };
  CREATE TYPE training::TrainingPage EXTENDING training::Interactable {
      CREATE PROPERTY duration: std::duration;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  CREATE TYPE users::User EXTENDING default::Auditable {
      CREATE MULTI LINK permissions: auth::Permission;
      CREATE MULTI LINK roles: auth::Role;
      CREATE MULTI LINK referrals: users::User {
          CREATE PROPERTY created_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
      };
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
  CREATE TYPE users::Rep EXTENDING users::User {
      CREATE REQUIRED MULTI LINK teams: team::Team {
          EXTENDING default::timed;
      };
      CREATE REQUIRED PROPERTY status: users::RepStatus {
          SET default := (users::RepStatus.ACTIVE);
      };
  };
  CREATE SCALAR TYPE training::TrainingLocation EXTENDING enum<MAINSPACE, HEARTSPACE, GEORGE_PORTER>;
  CREATE TYPE training::Training EXTENDING default::Auditable {
      CREATE MULTI LINK pages: training::TrainingPage;
      CREATE MULTI LINK questions: training::Question;
      CREATE MULTI LINK sections := (SELECT
          (.pages UNION .questions)
      ORDER BY
          .index ASC
      );
      CREATE LINK rep: training::Training {
          CREATE ANNOTATION std::description := 'The associated training that reps should have to supervise this. Empty if the training is for reps.';
      };
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE CONSTRAINT std::exclusive ON ((.name, .rep));
      CREATE INDEX fts::index ON (fts::with_options(.name, language := fts::Language.eng));
      CREATE REQUIRED PROPERTY compulsory: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY enabled: std::bool {
          SET default := true;
      };
      CREATE PROPERTY expires_after: std::duration;
      CREATE PROPERTY icon_url: std::str;
      CREATE REQUIRED PROPERTY in_person: std::bool {
          CREATE ANNOTATION std::description := 'Whether this training requires in person training.';
      };
      CREATE MULTI PROPERTY locations: training::TrainingLocation;
      CREATE PROPERTY training_lockout: std::duration;
  };
  CREATE TYPE auth::BlacklistedToken {
      CREATE ANNOTATION std::description := 'Used to mark JWTs as invalid';
      CREATE REQUIRED PROPERTY expires: std::datetime;
      CREATE REQUIRED PROPERTY token: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE SCALAR TYPE notification::DeliveryMethod EXTENDING enum<BANNER, EMAIL, TRAY, POPUP, DISCORD>;
  CREATE SCALAR TYPE notification::Status EXTENDING enum<DRAFT, REVIEW, QUEUED, SENDING, SENT, ERRORED>;
  CREATE SCALAR TYPE notification::Type EXTENDING enum<GENERAL, REFERRAL_SUCCESS, NEW_ANNOUNCEMENT, QUEUE_SLOT_ACTIVE, HEALTH_AND_SAFETY, REMINDER, INFRACTION, ADMIN, EVENT, ADVERT, TRAINING, PRINTING, RECRUITMENT>;
  CREATE TYPE notification::Notification EXTENDING default::Auditable {
      CREATE REQUIRED PROPERTY content: std::str {
          CREATE ANNOTATION std::description := 'The content (MARKDOWN) from plate';
      };
      CREATE REQUIRED MULTI PROPERTY delivery_method: notification::DeliveryMethod;
      CREATE REQUIRED PROPERTY dispatched_at: std::datetime {
          SET default := (std::datetime_of_statement());
          CREATE ANNOTATION std::description := "When the notification started rolling out or if it's scheduled when it will be dispatched.";
      };
      CREATE REQUIRED PROPERTY priority: std::int16 {
          SET default := 0;
          CREATE ANNOTATION std::description := 'The priority of the notification, defaults to zero. The higher the number the higher the priority. If there are two notifications trying to be used at the same time the higher priority one will take over. Otherwise the newer one prevails.';
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
  CREATE SCALAR TYPE notification::TargetTypes EXTENDING enum<ALL, USER, REPS, TEAM, MAILING_LIST>;
  CREATE TYPE notification::Target {
      CREATE LINK target_mailing_list: notification::MailingList {
          CREATE ANNOTATION std::description := 'If the target_type is set to MAILING_LIST then this will be set otherwise its null';
      };
      CREATE LINK target_team: team::Team {
          CREATE ANNOTATION std::description := 'If the target_type is set to TEAM then this will be set otherwise its null';
      };
      CREATE LINK target_user: users::User {
          CREATE ANNOTATION std::description := 'If the target_type is set to USER then this will be set otherwise its null';
      };
      CREATE REQUIRED PROPERTY target_type: notification::TargetTypes;
  };
  ALTER TYPE notification::Notification {
      CREATE REQUIRED LINK target: notification::Target {
          CREATE ANNOTATION std::description := 'Who will be receiving the notification';
      };
  };
  CREATE TYPE notification::SystemNotification EXTENDING notification::Notification {
      CREATE REQUIRED PROPERTY source: std::str {
          CREATE ANNOTATION std::description := 'The name of the service / module which caused this notification';
      };
  };
  CREATE SCALAR TYPE sign_in::LocationName EXTENDING enum<MAINSPACE, HEARTSPACE>;
  CREATE TYPE sign_in::Location EXTENDING default::Auditable {
      CREATE REQUIRED PROPERTY closing_time: cal::local_time;
      CREATE MULTI PROPERTY opening_days: std::int16 {
          CREATE ANNOTATION std::description := '1-7, the days of the week we are currently open, Monday (1) to Sunday (7)';
      };
      CREATE REQUIRED PROPERTY opening_time: cal::local_time;
      CREATE REQUIRED PROPERTY out_of_hours := (WITH
          current_time := 
              (SELECT
                  cal::to_local_time(std::datetime_of_statement(), 'Europe/London')
              )
      SELECT
          NOT ((((.opening_time <= current_time) AND (current_time <= .closing_time)) AND (<std::int16>std::datetime_get(std::datetime_of_statement(), 'isodow') IN .opening_days)))
      );
      CREATE REQUIRED PROPERTY in_of_hours_rep_multiplier: std::int16;
      CREATE REQUIRED PROPERTY max_users: std::int16;
      CREATE REQUIRED PROPERTY out_of_hours_rep_multiplier: std::int16;
      CREATE REQUIRED PROPERTY queue_enabled: std::bool {
          SET default := true;
          CREATE ANNOTATION std::description := 'Manually disable the queue.';
      };
      CREATE REQUIRED PROPERTY name: sign_in::LocationName {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE training::UserTrainingSession EXTENDING default::Auditable {
      CREATE REQUIRED LINK training: training::Training;
      CREATE REQUIRED LINK user: users::User;
      CREATE CONSTRAINT std::exclusive ON ((.user, .training));
      CREATE REQUIRED PROPERTY index: std::int16 {
          SET default := 0;
          CREATE ANNOTATION std::description := 'The `Interactable.index` for the section user is currently on.';
      };
  };
  CREATE SCALAR TYPE users::Platform EXTENDING enum<DISCORD, GITHUB>;
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
  CREATE ABSTRACT TYPE default::Timed EXTENDING default::CreatedAt {
      CREATE PROPERTY ends_at: std::datetime;
      CREATE REQUIRED PROPERTY duration := (std::assert_exists(((.ends_at - .created_at) IF EXISTS (.ends_at) ELSE (std::datetime_of_transaction() - .created_at))));
  };
  CREATE TYPE sign_in::SignIn EXTENDING default::Timed {
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED PROPERTY signed_out := (SELECT
          EXISTS (.ends_at)
      );
      CREATE REQUIRED LINK user: users::User;
      CREATE CONSTRAINT std::exclusive ON (.user) EXCEPT (.signed_out);
      CREATE REQUIRED PROPERTY tools: array<std::str>;
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
  CREATE TYPE sign_in::Agreement EXTENDING default::CreatedAt {
      CREATE REQUIRED PROPERTY content_hash: std::str {
          CREATE ANNOTATION std::description := 'The hash of the content of the markdown file.';
      };
      CREATE REQUIRED PROPERTY version: std::int16 {
          SET default := 1;
      };
      CREATE CONSTRAINT std::exclusive ON ((.version, .content_hash));
      CREATE REQUIRED PROPERTY content: std::str {
          CREATE ANNOTATION std::description := 'The content of the markdown file that are served to the user.';
      };
      CREATE REQUIRED PROPERTY name: std::str;
  };
  CREATE TYPE sign_in::QueuePlace EXTENDING default::CreatedAt {
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED LINK user: users::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY notified_at: std::datetime {
          CREATE ANNOTATION std::description := 'The time the user was emailed that they have a slot.';
      };
      CREATE PROPERTY ends_at := ((.notified_at + <cal::relative_duration>'15m'));
  };
  CREATE SCALAR TYPE sign_in::ReasonCategory EXTENDING enum<UNIVERSITY_MODULE, CO_CURRICULAR_GROUP, PERSONAL_PROJECT, SOCIETY, REP_SIGN_IN, EVENT>;
  CREATE TYPE sign_in::Reason EXTENDING default::CreatedAt {
      CREATE LINK agreement: sign_in::Agreement;
      CREATE REQUIRED PROPERTY name: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.name);
      CREATE REQUIRED PROPERTY category: sign_in::ReasonCategory;
  };
  CREATE TYPE sign_in::UserRegistration EXTENDING default::CreatedAt {
      CREATE REQUIRED LINK location: sign_in::Location;
      CREATE REQUIRED LINK user: users::User;
  };
  CREATE SCALAR TYPE users::InfractionType EXTENDING enum<WARNING, TEMP_BAN, PERM_BAN, RESTRICTION, TRAINING_ISSUE>;
  CREATE TYPE users::Infraction EXTENDING default::CreatedAt {
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
  ALTER TYPE users::User {
      CREATE MULTI LINK mailing_list_subscriptions: notification::MailingList;
      CREATE MULTI LINK notifications: notification::Notification {
          CREATE PROPERTY acknowledged: std::datetime {
              CREATE ANNOTATION std::description := 'Time the user has dismissed / marked as read / interacted with it (will be true if noti type is email & is delivered) otherwise empty';
          };
      };
      CREATE MULTI LINK agreements_signed: sign_in::Agreement {
          CREATE PROPERTY created_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
      };
      CREATE MULTI LINK training: training::Training {
          CREATE PROPERTY created_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
          CREATE PROPERTY in_person_created_at: std::datetime;
          CREATE PROPERTY in_person_signed_off_by: std::uuid;
      };
      CREATE MULTI LINK infractions: users::Infraction;
  };
  ALTER TYPE notification::MailingList {
      CREATE MULTI LINK subscribers := (.<mailing_list_subscriptions[IS users::User]);
  };
  ALTER TYPE sign_in::Agreement {
      CREATE MULTI LINK reasons := (SELECT
          sign_in::Reason
      FILTER
          (.agreement = __source__)
      );
  };
  ALTER TYPE sign_in::Location {
      CREATE MULTI LINK sign_ins := (SELECT
          sign_in::SignIn
      FILTER
          (NOT (.signed_out) AND (.location = __source__))
      );
  };
  ALTER TYPE sign_in::SignIn {
      CREATE REQUIRED LINK reason: sign_in::Reason;
  };
  ALTER TYPE sign_in::Location {
      CREATE MULTI LINK off_shift_reps := (WITH
          rep_sign_ins := 
              (SELECT
                  .sign_ins
              FILTER
                  ((.user IS users::Rep) AND (.reason.name = 'Rep Off Shift'))
              )
      SELECT
          rep_sign_ins.user
      );
      CREATE MULTI LINK on_shift_reps := (WITH
          rep_sign_ins := 
              (SELECT
                  .sign_ins
              FILTER
                  ((.user IS users::Rep) AND (.reason.name = 'Rep On Shift'))
              )
      SELECT
          rep_sign_ins.user
      );
      CREATE MULTI LINK queued := (SELECT
          sign_in::QueuePlace
      FILTER
          (.location = __source__)
      );
      CREATE MULTI LINK queued_users_that_can_sign_in := (SELECT
          ((SELECT
              .queued
          FILTER
              (.ends_at >= std::datetime_of_statement())
          )).user
      );
      CREATE MULTI LINK supervising_reps := (SELECT
          ((.on_shift_reps UNION .off_shift_reps) IF .out_of_hours ELSE .on_shift_reps)
      );
      CREATE REQUIRED PROPERTY max_count := (SELECT
          std::min({((SELECT
              (.out_of_hours_rep_multiplier IF .out_of_hours ELSE .in_of_hours_rep_multiplier)
          ) * std::count(.supervising_reps)), .max_users})
      );
      CREATE REQUIRED PROPERTY can_sign_in := (SELECT
          ((std::count(.sign_ins) < .max_count) AND (((.max_count + std::count(.supervising_reps)) - std::count(.sign_ins)) >= 0))
      );
      CREATE REQUIRED PROPERTY queue_in_use := (SELECT
          ((std::assert(.queue_enabled, message := 'Queue has been manually disabled') AND EXISTS (.queued)) OR NOT (.can_sign_in))
      );
      CREATE REQUIRED PROPERTY status := (WITH
          current_time := 
              (SELECT
                  cal::to_local_time(std::datetime_of_statement(), 'Europe/London')
              )
      SELECT
          ('open' IF (std::count(.on_shift_reps) > 0) ELSE ('soon' IF ((((.opening_time - <cal::relative_duration>'30m') <= current_time) AND (current_time <= (.closing_time - <cal::relative_duration>'30m'))) AND (std::datetime_get(std::datetime_of_statement(), 'isodow') IN .opening_days)) ELSE 'closed'))
      );
  };
  ALTER TYPE team::Team {
      CREATE MULTI LINK all_members := (SELECT
          users::Rep
      FILTER
          std::any((.teams.id = __source__.id))
      );
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
