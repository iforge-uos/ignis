CREATE MIGRATION m152awy4fbnwnxe2rekhxidschur4vt4a3r4a2igtyhx6ezawhjkyq
    ONTO m1gap6hvgbagbmjnjd6bejcnanoam2ihhhhi5iv6bhto6efgbdu5xa
{
  CREATE SCALAR TYPE sign_in::LocationStatus EXTENDING enum<OPEN, SOON, CLOSED>;
  ALTER TYPE sign_in::Location {
      ALTER PROPERTY status {
          USING (WITH
              current_time := 
                  (SELECT
                      cal::to_local_time(std::datetime_of_statement(), 'Europe/London')
                  )
          SELECT
              (sign_in::LocationStatus.OPEN IF (std::count(.on_shift_reps) > 0) ELSE (sign_in::LocationStatus.SOON IF ((((.opening_time - <cal::relative_duration>'30m') <= current_time) AND (current_time <= (.closing_time - <cal::relative_duration>'30m'))) AND (std::datetime_get(std::datetime_of_statement(), 'isodow') IN .opening_days)) ELSE sign_in::LocationStatus.CLOSED))
          );
      };
  };
};
