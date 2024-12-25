CREATE MIGRATION m1qb4x2zuzk5uqgw7p355fcxdblrcsn45ukn3fnhwcaho7y52y2rzq
    ONTO m17q4qvf66ftijtdy3tchfo6ausc5wyud7ggc4ffnulvni4ckofq3q
{
      ALTER TYPE sign_in::Location {
      ALTER PROPERTY opening_days {
          ALTER ANNOTATION std::description := '1-7, the days of the week we are currently open, Monday (1) to Sunday (7)';
      };
      ALTER PROPERTY out_of_hours {
          USING (WITH
              current_time := 
                  (SELECT
                      cal::to_local_time(std::datetime_of_statement(), 'Europe/London')
                  )
          SELECT
              NOT ((((.opening_time <= current_time) AND (current_time <= .closing_time)) AND (<std::int16>std::datetime_get(std::datetime_of_statement(), 'isodow') IN .opening_days)))
          );
      };
      ALTER PROPERTY status {
          USING (WITH
              current_time := 
                  (SELECT
                      cal::to_local_time(std::datetime_of_statement(), 'Europe/London')
                  )
          SELECT
              ('open' IF (std::count(.on_shift_reps) > 0) ELSE ('soon' IF ((((.opening_time - <cal::relative_duration>'30m') <= current_time) AND (current_time <= (.closing_time - <cal::relative_duration>'30m'))) AND (std::datetime_get(std::datetime_of_statement(), 'isodow') IN .opening_days)) ELSE 'closed'))
          );
      };
  };
};
