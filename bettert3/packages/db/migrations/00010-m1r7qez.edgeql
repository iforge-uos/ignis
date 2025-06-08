CREATE MIGRATION m1r7qezrtxamj4hskwbtccefbdeywjt543gvd3icyi3slg24dbta4q
    ONTO m166rnztim2a5mc4742lbdbu73ep5hkqdxs5azn7depjspmcdi5ala
{
  ALTER TYPE notification::Notification {
      ALTER LINK target {
          CREATE ANNOTATION std::description := 'Who will be receiving the notification';
      };
  };
  ALTER TYPE sign_in::Agreement {
      CREATE ACCESS POLICY admin_only
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update agreements';
          };
  };
  ALTER TYPE sign_in::Location {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update location info';
          };
  };
  ALTER TYPE sign_in::Location {
      ALTER PROPERTY in_of_hours_rep_multiplier {
          RENAME TO in_hours_rep_multiplier;
      };
      ALTER PROPERTY max_count {
          USING (WITH
              multiplier := 
                  (.out_of_hours_rep_multiplier IF .out_of_hours ELSE .in_hours_rep_multiplier)
          SELECT
              std::min({((multiplier * std::count(.supervising_reps)) + std::count(.off_shift_reps)), .max_users})
          );
      };
      ALTER PROPERTY can_sign_in {
          USING ((std::count(.sign_ins) < .max_count));
      };
  };
  ALTER TYPE sign_in::QueuePlace {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
      CREATE ACCESS POLICY edit_self
          ALLOW ALL USING ((GLOBAL default::user ?= .user)) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
  };
  ALTER TYPE sign_in::Reason {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update reasons';
          };
  };
  ALTER TYPE sign_in::SignIn {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can operate on all sign-ins';
          };
      CREATE ACCESS POLICY view_self
          ALLOW SELECT USING ((GLOBAL default::user ?= .user)) {
              SET errmessage := 'Can only view your own sign-ins';
          };
  };
  ALTER TYPE sign_in::UserRegistration {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update registrations';
          };
  };
  ALTER TYPE training::Answer {
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
      CREATE ACCESS POLICY h_and_s_or_higher
          ALLOW ALL USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              ((EXISTS (({'Admin'} INTERSECT user.roles.name)) OR ((user IS users::Rep) AND EXISTS (({'H&S'} INTERSECT user[IS users::Rep].teams.name)))) ?? false)
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
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
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
  };
  ALTER TYPE training::Session {
      CREATE ACCESS POLICY allow_reps
          ALLOW INSERT USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              (NOT (EXISTS (.training.rep)) OR EXISTS (({'Rep'} INTERSECT user.roles.name)))
          ) {
              SET errmessage := 'Only reps can complete rep training';
          };
      CREATE ACCESS POLICY allow_self_or_admin
          ALLOW ALL USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              (EXISTS (({'Admin'} INTERSECT user.roles.name)) OR (user ?= .user))
          ) {
              SET errmessage := 'Only self/admins can view sessions';
          };
  };
  ALTER TYPE training::Training {
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
      CREATE ACCESS POLICY everyone
          ALLOW SELECT ;
      CREATE ACCESS POLICY select_if_completed_basic
          ALLOW SELECT USING (WITH
              user := 
                  GLOBAL default::user
          SELECT
              (NOT (EXISTS (.rep)) AND (__subject__ IN user.training.rep))
          ) {
              SET errmessage := 'Only H&S members or admins can update training';
          };
  };
  ALTER TYPE users::Infraction {
      CREATE ACCESS POLICY desk_or_higher
          ALLOW ALL USING (EXISTS (({'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the desk account or admins can update infractions';
          };
  };
  ALTER TYPE users::User {
      CREATE ACCESS POLICY rep_or_higher
          ALLOW ALL USING (EXISTS (({'Rep', 'Desk', 'Admin'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := "Only reps can see everyone's profile";
          };
      CREATE ACCESS POLICY view_self
          ALLOW ALL USING ((GLOBAL default::user ?= __subject__)) {
              SET errmessage := 'Can only view your own profile';
          };
  };
};
