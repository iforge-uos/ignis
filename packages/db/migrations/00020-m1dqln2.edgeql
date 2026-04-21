CREATE MIGRATION m1dqln2r2wsgiwjbbqgzupuz67ebkfvrqpt3yhswnh43hml46pzfhq
    ONTO m1lno2vozlqw34oakzxmdm5fsnz2lelsd66tsr3qfhops7mn5danva
{
  CREATE GLOBAL default::current_user_role_names := ((GLOBAL default::user).roles.name);
  CREATE GLOBAL default::is_desk_or_higher := (EXISTS (({'Desk', 'Admin'} INTERSECT GLOBAL default::current_user_role_names)));
  ALTER TYPE sign_in::Agreement {
      ALTER ACCESS POLICY admin_only USING (GLOBAL default::is_desk_or_higher);
  };
  ALTER TYPE sign_in::Location {
      ALTER ACCESS POLICY desk_or_higher USING (GLOBAL default::is_desk_or_higher);
  };
  ALTER TYPE sign_in::QueuePlace {
      ALTER ACCESS POLICY desk_or_higher USING (GLOBAL default::is_desk_or_higher);
  };
  ALTER TYPE sign_in::Reason {
      ALTER ACCESS POLICY desk_or_higher USING (GLOBAL default::is_desk_or_higher);
  };
  ALTER TYPE sign_in::SignIn {
      ALTER ACCESS POLICY desk_or_higher USING (GLOBAL default::is_desk_or_higher);
  };
  ALTER TYPE sign_in::UserRegistration {
      ALTER ACCESS POLICY desk_or_higher USING (GLOBAL default::is_desk_or_higher);
  };
  ALTER TYPE training::Session {
      ALTER ACCESS POLICY allow_reps USING (SELECT
          (NOT (EXISTS (.training.rep)) OR EXISTS (({'Rep'} INTERSECT GLOBAL default::current_user_role_names)))
      );
  };
  CREATE GLOBAL default::is_admin := (('Admin' IN GLOBAL default::current_user_role_names));
  ALTER TYPE training::Session {
      ALTER ACCESS POLICY allow_self_or_admin USING (WITH
          user := 
              GLOBAL default::user
      SELECT
          (GLOBAL default::is_admin OR (user ?= .user))
      );
  };
  ALTER TYPE training::Training {
      ALTER ACCESS POLICY desk_or_higher_edit USING (WITH
          user := 
              GLOBAL default::user
      SELECT
          ((GLOBAL default::is_admin OR ((user IS users::Rep) AND EXISTS (({'H&S'} INTERSECT user[IS users::Rep].teams.name)))) ?? false)
      );
  };
  ALTER TYPE training::Answer {
      ALTER ACCESS POLICY h_and_s_or_higher USING (WITH
          user := 
              GLOBAL default::user
      SELECT
          ((GLOBAL default::is_admin OR ((user IS users::Rep) AND EXISTS (({'H&S'} INTERSECT user[IS users::Rep].teams.name)))) ?? false)
      );
  };
  ALTER TYPE users::Infraction {
      ALTER ACCESS POLICY desk_or_higher USING (GLOBAL default::is_desk_or_higher);
  };
  CREATE GLOBAL default::is_rep_or_higher := (EXISTS (({'Rep', 'Desk', 'Admin'} INTERSECT GLOBAL default::current_user_role_names)));
  ALTER TYPE users::User {
      ALTER ACCESS POLICY rep_or_higher USING (GLOBAL default::is_rep_or_higher);
  };
  ALTER TYPE users::User {
      CREATE ACCESS POLICY allow_self
          ALLOW ALL USING ((.identity ?= GLOBAL ext::auth::ClientTokenIdentity)) {
              SET errmessage := 'Can only view or modify your own profile';
          };
  };
  ALTER TYPE users::User {
      DROP ACCESS POLICY view_self;
  };
};
