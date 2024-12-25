CREATE MIGRATION m1nzppmd2hd3hs4glv3tthtuf7vpfjybion47332hityyrwsxeqgwa
    ONTO m17e2u7yo64hdudtuxx2dssutwwa6exjts4ea55vs623xgnvl2asoq
{
  CREATE ALIAS training::Page := (
      training::TrainingPage
  );
  ALTER TYPE sign_in::Location {
      ALTER LINK off_shift_reps {
          USING (WITH
              rep_sign_ins := 
                  (SELECT
                      .sign_ins
                  FILTER
                      ((.user IS users::Rep) AND (.reason.name = 'Rep Off Shift'))
                  )
          SELECT
              rep_sign_ins.user[IS users::Rep]
          );
      };
      ALTER LINK on_shift_reps {
          USING (WITH
              rep_sign_ins := 
                  (SELECT
                      .sign_ins
                  FILTER
                      ((.user IS users::Rep) AND (.reason.name = 'Rep On Shift'))
                  )
          SELECT
              rep_sign_ins.user[IS users::Rep]
          );
      };
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
      CREATE MULTI LINK supervisable_training := (SELECT
          DISTINCT (.supervising_reps.supervisable_training)
      );
  };
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
  ALTER TYPE training::Answer {
      ALTER PROPERTY description {
          ALTER ANNOTATION std::description := "The text shown after a user passes their answer giving a lil' explanation about whatever they said.";
      };
  };
  ALTER TYPE training::UserTrainingSession RENAME TO training::Session;
  ALTER TYPE users::User {
      ALTER LINK training {
          CREATE PROPERTY infraction: std::uuid;
      };
  };
  CREATE SCALAR TYPE training::Selectability EXTENDING enum<NO_TRAINING, REVOKED, EXPIRED, REPS_UNTRAINED, IN_PERSON_MISSING>;
  ALTER SCALAR TYPE training::TrainingLocation RENAME TO training::LocationName;
};
