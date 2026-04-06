CREATE MIGRATION m16nhciiitg6sowljef35k4532zdfffwvz2nlvabq7aryo3jwv6aqq
    ONTO m1kkagwrcjcs5lui7eggbwpomygmbw4ctrmvfliwuy3aivrlp35ezq
{
  ALTER FUNCTION training::get_status(training: training::Training, user: users::User, NAMED ONLY collapse: std::bool = true) USING (WITH
      is_rep := 
          (user IS users::Rep)
      ,
      collapse_ := 
          (collapse AND is_rep)
      ,
      is_user_training := 
          EXISTS (training.rep)
      ,
      u := 
          user {
              training FILTER (.id = training.id)
          }
      ,
      training_in_person_needed := 
          training.in_person
      ,
      training_online_done := 
          EXISTS (u.training@created_at)
      ,
      training_in_person_done := 
          EXISTS (u.training@in_person_created_at)
      ,
      training_revoked := 
          EXISTS (u.training@infraction)
      ,
      training_expired := 
          false
      ,
      r := 
          user {
              training FILTER (.id = training.rep.id)
          }
      ,
      rep_online := 
          EXISTS (r.training@created_at)
      ,
      rep_in_person_needed := 
          (training.rep.in_person ?? false)
      ,
      rep_in_person_done := 
          EXISTS (r.training@in_person_created_at)
      ,
      rep_revoked := 
          EXISTS (r.training@infraction)
      ,
      rep_expired := 
          false
      ,
      key := 
          (SELECT
              (default::bin((((((((((('1' IF training_in_person_needed ELSE '0') ++ ('1' IF rep_in_person_needed ELSE '0')) ++ ('1' IF training_online_done ELSE '0')) ++ ('1' IF training_in_person_done ELSE '0')) ++ ('1' IF rep_online ELSE '0')) ++ ('1' IF rep_in_person_done ELSE '0')) ++ ('1' IF training_expired ELSE '0')) ++ ('1' IF rep_expired ELSE '0')) ++ ('1' IF training_revoked ELSE '0')) ++ ('1' IF rep_revoked ELSE '0'))) IF collapse_ ELSE default::bin(((((('1' IF training_in_person_needed ELSE '0') ++ ('1' IF training_online_done ELSE '0')) ++ ('1' IF training_in_person_done ELSE '0')) ++ ('1' IF training_expired ELSE '0')) ++ ('1' IF training_revoked ELSE '0'))))
          )
      ,
      lookups := 
          (GLOBAL training::COLLAPSED_LOOKUPS IF collapse_ ELSE GLOBAL training::LOOKUPS)
  SELECT
      (IF (NOT (collapse_) OR is_user_training) THEN (SELECT
          lookups FILTER
              (std::bit_and(key, .care) = .value)
          ORDER BY
              .value DESC
      LIMIT
          1
      ) ELSE {})
  );
};
