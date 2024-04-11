CREATE MIGRATION m1eewyk2vcv4ym43hugslnzjyodkwuda4sia35yf764hsqyddocazq
    ONTO initial
{
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
  CREATE TYPE auth::BlacklistedToken {
      CREATE ANNOTATION std::description := 'Used to mark JWTs as invalid';
      CREATE REQUIRED PROPERTY expires: std::datetime;
      CREATE REQUIRED PROPERTY token: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE notification::Announcement EXTENDING default::Auditable {
      CREATE MULTI LINK views: users::User {
          CREATE PROPERTY viewed_at: std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
      };
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE REQUIRED PROPERTY title: std::str;
  };
  CREATE TYPE notification::MailingList EXTENDING default::Auditable {
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
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
  CREATE SCALAR TYPE training::TrainingLocation EXTENDING enum<MAINSPACE, HEARTSPACE, GEORGE_PORTER>;
  CREATE TYPE training::Training EXTENDING default::Auditable {
      CREATE LINK rep: training::Training {
          CREATE ANNOTATION std::description := 'Empty if the training is for reps.';
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
      CREATE REQUIRED PROPERTY in_person: std::bool {
          CREATE ANNOTATION std::description := 'Whether this training requires in person training.';
      };
      CREATE MULTI PROPERTY locations: training::TrainingLocation;
      CREATE PROPERTY training_lockout: std::duration;
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
  CREATE SCALAR TYPE sign_in::SignInLocation EXTENDING enum<MAINSPACE, HEARTSPACE>;
  CREATE TYPE sign_in::SignIn EXTENDING default::Timed {
      CREATE REQUIRED PROPERTY location: sign_in::SignInLocation;
      CREATE PROPERTY signed_out: std::bool {
          SET default := false;
      };
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
  };
  CREATE TYPE sign_in::QueuePlace EXTENDING default::CreatedAt {
      CREATE REQUIRED PROPERTY location: sign_in::SignInLocation;
      CREATE REQUIRED LINK user: users::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY can_sign_in: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY position: std::int16;
  };
  CREATE SCALAR TYPE sign_in::SignInReasonCategory EXTENDING enum<UNIVERSITY_MODULE, CO_CURRICULAR_GROUP, PERSONAL_PROJECT, SOCIETY, REP_SIGN_IN, EVENT>;
  CREATE TYPE sign_in::SignInReason EXTENDING default::CreatedAt {
      CREATE LINK agreement: sign_in::Agreement;
      CREATE REQUIRED PROPERTY name: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.name);
      CREATE REQUIRED PROPERTY category: sign_in::SignInReasonCategory;
  };
  CREATE TYPE sign_in::UserRegistration EXTENDING default::CreatedAt {
      CREATE REQUIRED LINK user: users::User;
      CREATE REQUIRED PROPERTY location: sign_in::SignInLocation;
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
  CREATE SCALAR TYPE notification::NotificationType EXTENDING enum<GENERAL, REFERRAL_SUCCESS, NEW_ANNOUNCEMENT, QUEUE_SLOT_ACTIVE>;
  CREATE TYPE notification::Notification {
      CREATE MULTI LINK users: users::User {
          CREATE PROPERTY read: std::bool {
              SET default := false;
          };
      };
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE REQUIRED PROPERTY type: notification::NotificationType;
  };
  ALTER TYPE sign_in::Agreement {
      CREATE MULTI LINK reasons := (SELECT
          sign_in::SignInReason
      FILTER
          (.agreement = __source__)
      );
  };
  CREATE TYPE sign_in::List {
      CREATE REQUIRED PROPERTY location: sign_in::SignInLocation {
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.location);
      CREATE MULTI LINK queued := (SELECT
          sign_in::QueuePlace
      FILTER
          (.location = __source__.location)
      );
      CREATE MULTI LINK sign_ins := (SELECT
          sign_in::SignIn
      FILTER
          (NOT (.signed_out) AND (.location = __source__.location))
      );
  };
  ALTER TYPE sign_in::SignIn {
      CREATE REQUIRED LINK reason: sign_in::SignInReason;
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
  CREATE ABSTRACT TYPE training::Interactable {
      CREATE REQUIRED LINK parent: training::Training;
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE REQUIRED PROPERTY enabled: std::bool {
          SET default := true;
      };
      CREATE REQUIRED PROPERTY index: std::int16;
      CREATE CONSTRAINT std::exclusive ON ((.parent, .index));
  };
  CREATE SCALAR TYPE training::AnswerType EXTENDING enum<`SINGLE`, MULTI>;
  CREATE TYPE training::Question EXTENDING training::Interactable {
      CREATE MULTI LINK answers: training::Answer;
      CREATE REQUIRED PROPERTY type: training::AnswerType;
  };
  CREATE TYPE training::TrainingPage EXTENDING training::Interactable {
      CREATE PROPERTY duration: std::duration;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE training::Training {
      CREATE MULTI LINK sections := (SELECT
          training::Interactable
      FILTER
          (.parent = __source__)
      ORDER BY
          .index ASC
      );
      CREATE MULTI LINK questions: training::Question;
      CREATE MULTI LINK pages: training::TrainingPage;
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
  CREATE SCALAR TYPE notification::DeliveryMethod EXTENDING enum<IN_APP, EMAIL>;
};
