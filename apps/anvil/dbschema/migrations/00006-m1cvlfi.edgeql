CREATE MIGRATION m1cvlfi4unfhvry3yrqtktivwwypaojjpoj5lybyempqxbracx7zrq
    ONTO m1mngcfp3ziedlm627t2vc2bdntf77sslql67exrvr2whyk2wdh4gq
{
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
      ALTER LINK supervisable_training {
          USING (SELECT
              DISTINCT (.supervising_reps.supervisable_training)
          );
      };
  };
  ALTER TYPE training::Answer {
      ALTER PROPERTY description {
          ALTER ANNOTATION std::description := "The text shown after a user passes their answer giving a lil' explanation about whatever they said.";
      };
  };
  ALTER TYPE training::UserTrainingSession RENAME TO training::Session;
  CREATE SCALAR TYPE training::Selectability EXTENDING enum<NO_TRAINING, REVOKED, REPS_UNTRAINED, IN_PERSON_MISSING, SELECTABLE>;
  ALTER SCALAR TYPE training::TrainingLocation RENAME TO training::LocationName;
};
