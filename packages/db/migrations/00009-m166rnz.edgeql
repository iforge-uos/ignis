CREATE MIGRATION m166rnztim2a5mc4742lbdbu73ep5hkqdxs5azn7depjspmcdi5ala
    ONTO m1tlkq5yfhdeom3h3jk2lcxgxohptcbzro2wxptvw25qdge64kev3q
{
  ALTER TYPE sign_in::Location {
      ALTER LINK off_shift_reps {
          USING (WITH
              rep_sign_ins := 
                  (SELECT
                      .sign_ins
                  FILTER
                      ((.user IS users::Rep) AND (.reason.name != 'Rep On Shift'))
                  )
          SELECT
              rep_sign_ins.user[IS users::Rep]
          );
      };
      ALTER PROPERTY max_count {
          USING (WITH
              multiplier := 
                  (.out_of_hours_rep_multiplier IF .out_of_hours ELSE .in_of_hours_rep_multiplier)
          SELECT
              std::min({((multiplier * std::count(.supervising_reps)) + std::count(.off_shift_reps)), .max_users})
          );
      };
  };
};
