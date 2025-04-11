CREATE MIGRATION m1fpwxinh7p2a57dmufic6lvsgblqiw7yuptrw2ocw4zmb53nvywwa
    ONTO m1r7qezrtxamj4hskwbtccefbdeywjt543gvd3icyi3slg24dbta4q
{
  CREATE EXTENSION pgvector VERSION '0.7';
  CREATE EXTENSION ai VERSION '1.0';
  CREATE MODULE ai_rep IF NOT EXISTS;
  CREATE TYPE ai_rep::Question {
      CREATE ACCESS POLICY user_is_rep
          ALLOW ALL USING (EXISTS (({'Rep', 'Incoming Rep'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the reps can access these questions';
          };
      CREATE REQUIRED PROPERTY answer: std::str;
      CREATE REQUIRED PROPERTY title: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE DEFERRED INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON (((.title ++ ' ') ++ .answer));
      CREATE REQUIRED PROPERTY rep_only: std::bool {
          SET default := false;
      };
  };
  ALTER TYPE users::User {
      CREATE MULTI LINK sign_ins := (.<user[IS sign_in::SignIn]);
  };
  ALTER TYPE sign_in::Location {
      ALTER PROPERTY max_count {
          USING (WITH
              multiplier := 
                  (.out_of_hours_rep_multiplier IF .out_of_hours ELSE .in_hours_rep_multiplier)
          SELECT
              std::min({((multiplier * std::count(.supervising_reps)) + (std::count(.off_shift_reps) IF NOT (.out_of_hours) ELSE 0)), .max_users})
          );
      };
      CREATE REQUIRED PROPERTY available_capacity := (SELECT
          ((.max_count - std::count(.sign_ins)) - std::count(.queued_users_that_can_sign_in))
      );
  };
};
