CREATE MIGRATION m1kh5wprsqd4uc336x5yybilcbejw3h7wk5bakrst2nginmvqvtbkq
    ONTO m17wd2wc33skrl2en5t7pht7adzacuqyeczimsq37tshhuhyv3yqba
{
  CREATE TYPE ai_rep::Question {
      CREATE ACCESS POLICY user_is_rep
          ALLOW ALL USING (EXISTS (({'Rep', 'Incoming Rep'} INTERSECT (GLOBAL default::user).roles.name))) {
              SET errmessage := 'Only the reps can access these questions';
          };
      CREATE REQUIRED PROPERTY answer: std::str;
      CREATE REQUIRED PROPERTY title: std::str;
      CREATE DEFERRED INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON (((.title ++ ' ') ++ .answer));
      CREATE REQUIRED PROPERTY rep_only: std::bool {
          SET default := false;
      };
  };
};
