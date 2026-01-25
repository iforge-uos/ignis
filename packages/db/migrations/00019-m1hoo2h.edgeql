CREATE MIGRATION m1hoo2h2524gppemugvzye5f55fsnq5dblq2gwzibgbumxygovvsnq
    ONTO m1z77llmvgmkmy3izyy6folbkt6wscdjiwndskifwbcrdlgqxeslba
{
  ALTER FUNCTION training::get_statuses(user: users::User, NAMED ONLY collapsed: std::bool = true) USING (WITH
      is_rep := 
          (user IS users::Rep)
      ,
      training_user_does_not_have := 
          (SELECT
              training::Training
          FILTER
              ((.id NOT IN user.training.id) AND (NOT (collapsed) OR EXISTS (.rep)))
          )
  SELECT
      std::assert_single(std::assert_exists(<training::StatusReturn>std::json_object_pack((FOR training IN user.training
      UNION 
          ((WITH
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
          SELECT
              (<std::str>training.id, (SELECT
                  <std::json>(WITH
                      key := 
                          (SELECT
                              (default::bin(((((((((('1' IF training_in_person_needed ELSE '0') ++ ('1' IF rep_in_person_needed ELSE '0')) ++ ('1' IF training_in_person_done ELSE '0')) ++ ('1' IF rep_online ELSE '0')) ++ ('1' IF rep_in_person_done ELSE '0')) ++ ('1' IF training_expired ELSE '0')) ++ ('1' IF rep_expired ELSE '0')) ++ ('1' IF training_revoked ELSE '0')) ++ ('1' IF rep_revoked ELSE '0'))) IF (collapsed OR NOT (is_rep)) ELSE default::bin((((('1' IF training_in_person_needed ELSE '0') ++ ('1' IF training_in_person_done ELSE '0')) ++ ('1' IF training_expired ELSE '0')) ++ ('1' IF training_revoked ELSE '0'))))
                          )
                      ,
                      lookups := 
                          (IF (collapsed OR NOT (is_rep)) THEN GLOBAL training::COLLAPSED_LOOKUPS ELSE GLOBAL training::LOOKUPS)
                      ,
                      selected := 
                          std::assert_exists((SELECT
                              lookups FILTER
                                  (std::bit_and(key, .care) = .value)
                          LIMIT
                              1
                          ))
                  SELECT
                      (IF ((collapsed OR NOT (is_rep)) OR is_user_training) THEN <std::json>{
                          name := training.name,
                          status := selected.s,
                          next_step := selected.n
                      } ELSE {})
                  )
              ))
          ) UNION (FOR training IN training_user_does_not_have
          UNION 
              (<std::str>training.id, <std::json>{
                  name := training.name,
                  status := training::Status.UNTRAINED,
                  next_step := training::NextStep.DO_ONLINE
              })))))))
  );
};
