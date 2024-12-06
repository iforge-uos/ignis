CREATE MIGRATION m1mngcfp3ziedlm627t2vc2bdntf77sslql67exrvr2whyk2wdh4gq
    ONTO m17e2u7yo64hdudtuxx2dssutwwa6exjts4ea55vs623xgnvl2asoq
{
  ALTER TYPE sign_in::Location {
      CREATE MULTI LINK supervisable_training := (FOR rep IN .supervising_reps
      UNION 
          (WITH
              current_training := 
                  rep.training
          SELECT
              rep.training
          FILTER
              ((EXISTS (.rep) AND (.rep IN current_training)) AND (NOT (.in_person) OR EXISTS (@in_person_created_at)))
          ));
  };
};
