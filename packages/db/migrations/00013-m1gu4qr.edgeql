CREATE MIGRATION m1gu4qrigpxtdw75jvdoyu7u2hvac4tqfa2nmsxqoxcyef2pe5g3zq
    ONTO m1ppns2llyruympbotb3vjalamvvelncxwh7ownas6v42xocdnvdna
{
  ALTER GLOBAL training::COLLAPSED_LOOKUPS USING (SELECT
      (((((((((((((((
          care := default::bin('0_0000_1000'),
          value := default::bin('0_0000_1000'),
          s := training::Status.REVOKED,
          n := training::NextStep.DO_ONLINE
      ) UNION (
          care := default::bin('0_0000_0010'),
          value := default::bin('0_0000_0010'),
          s := training::Status.REVOKED,
          n := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('0_0001_1010'),
          value := default::bin('0_0001_0010'),
          s := training::Status.EXPIRED,
          n := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('0_0000_1110'),
          value := default::bin('0_0000_1100'),
          s := training::Status.EXPIRED,
          n := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('1_0000_1111'),
          value := default::bin('0_0000_0000'),
          s := training::Status.ONLINE_COMPLETE,
          n := training::NextStep.DO_REP_ONLINE
      )) UNION (
          care := default::bin('1_0110_1111'),
          value := default::bin('1_0000_0000'),
          s := training::Status.ONLINE_COMPLETE,
          n := training::NextStep.DO_IN_PERSON_OR_REP_ONLINE
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1110_0000'),
          s := training::Status.USER_TRAINING_COMPLETE,
          n := training::NextStep.DO_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_0110_1111'),
          value := default::bin('1_0100_0000'),
          s := training::Status.USER_TRAINING_COMPLETE,
          n := training::NextStep.DO_REP_ONLINE
      )) UNION (
          care := default::bin('1_1011_1111'),
          value := default::bin('0_1010_0000'),
          s := training::Status.REP_ONLINE_COMPLETE,
          n := training::NextStep.DO_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1010_0000'),
          s := training::Status.REP_ONLINE_COMPLETE,
          n := training::NextStep.DO_IN_PERSON_OR_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_0010_0000'),
          s := training::Status.REP_ONLINE_COMPLETE_NO_IN_PERSON,
          n := training::NextStep.DO_IN_PERSON
      )) UNION (
          care := default::bin('1_1010_1111'),
          value := default::bin('0_0010_0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1011_1111'),
          value := default::bin('0_1011_0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1110_1111'),
          value := default::bin('1_0110_0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1111_0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      ))
  );
  ALTER GLOBAL training::LOOKUPS USING (SELECT
      (((((
          care := default::bin('0001'),
          value := default::bin('0001'),
          s := training::Status.REVOKED,
          n := training::NextStep.DO_ONLINE
      ) UNION (
          care := default::bin('0011'),
          value := default::bin('0010'),
          s := training::Status.EXPIRED,
          n := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('1011'),
          value := default::bin('0000'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      )) UNION (
          care := default::bin('1011'),
          value := default::bin('1000'),
          s := training::Status.ONLINE_COMPLETE,
          n := training::NextStep.DO_IN_PERSON
      )) UNION (
          care := default::bin('1111'),
          value := default::bin('1100'),
          s := training::Status.FULLY_COMPLETE,
          n := training::NextStep.NONE
      ))
  );
  CREATE FUNCTION training::get_statuses(user: users::User, NAMED ONLY collapsed: std::bool = true) ->  training::StatusReturn USING (WITH
      is_rep := 
          (user IS users::Rep)
      ,
      training_user_does_not_have := 
          (SELECT
              training::Training
          FILTER
              ((.id NOT IN user.training.id) AND (NOT (collapsed) OR EXISTS (.rep)))
          )
      ,
      expires := 
          training::get_expiry_dates(user)
      ,
      training_json_links := 
          (WITH
              training_json := 
                  std::json_array_unpack(std::json_get(<std::json>(SELECT
                      user {
                          training: {
                              id,
                              created_at := @created_at,
                              in_person_created_at := @in_person_created_at,
                              infraction := @infraction
                          }
                      }
                  ), 'training'))
              ,
              grouped := 
                  (GROUP
                      training_json
                  USING
                      id_ := 
                          std::json_get(training_json, 'id')
                  BY id_)
              ,
              iter1 := 
                  std::array_agg(grouped.key.id_)
              ,
              iter2 := 
                  std::array_agg(grouped.elements)
          SELECT
              std::json_object_pack((FOR i IN std::range_unpack(std::range(0, std::len(iter1)))
              UNION 
                  (SELECT
                      (<std::str>(iter1)[i], (iter2)[i])
                  )))
          )
  SELECT
      std::assert_single(std::assert_exists(<training::StatusReturn>std::json_object_pack((FOR training IN user.training
      UNION 
          ((WITH
              is_user_training := 
                  EXISTS (training.rep)
              ,
              linked_training := 
                  std::json_get(training_json_links, <std::str>training.id)
              ,
              training_in_person_needed := 
                  training.in_person
              ,
              training_in_person_done := 
                  EXISTS (std::json_get(linked_training, 'in_person_created_at'))
              ,
              training_revoked := 
                  (std::json_typeof((std::json_get(linked_training, 'infraction') ?? std::to_json('null'))) != 'null')
              ,
              training_expired := 
                  false
              ,
              rep_link := 
                  (SELECT
                      user.training
                  FILTER
                      (.id = training.rep.id)
                  )
              ,
              linked_rep_training := 
                  std::json_get(training_json_links, <std::str>rep_link.id)
              ,
              rep_online := 
                  EXISTS (std::json_get(linked_rep_training, 'created_at'))
              ,
              rep_in_person_needed := 
                  (training.rep.in_person ?? false)
              ,
              rep_in_person_done := 
                  EXISTS (std::json_get(linked_rep_training, 'in_person_created_at'))
              ,
              rep_revoked := 
                  (std::json_typeof((std::json_get(linked_rep_training, 'infraction') ?? std::to_json('null'))) != 'null')
              ,
              rep_expired := 
                  false
          SELECT
              (<std::str>training.id, (SELECT
                  <std::json>(WITH
                      key := 
                          (SELECT
                              (default::bin((((('1' IF training_in_person_needed ELSE '0') ++ ('1' IF training_in_person_done ELSE '0')) ++ ('1' IF training_expired ELSE '0')) ++ ('1' IF training_revoked ELSE '0'))) IF (collapsed OR NOT (is_rep)) ELSE default::bin(((((((((('1' IF training_in_person_needed ELSE '0') ++ ('1' IF rep_in_person_needed ELSE '0')) ++ ('1' IF training_in_person_done ELSE '0')) ++ ('1' IF rep_online ELSE '0')) ++ ('1' IF rep_in_person_done ELSE '0')) ++ ('1' IF training_expired ELSE '0')) ++ ('1' IF rep_expired ELSE '0')) ++ ('1' IF training_revoked ELSE '0')) ++ ('1' IF rep_revoked ELSE '0'))))
                          )
                      ,
                      lookups := 
                          (SELECT
                              (GLOBAL training::COLLAPSED_LOOKUPS IF (collapsed OR NOT (is_rep)) ELSE GLOBAL training::LOOKUPS)
                          )
                      ,
                      selected := 
                          std::assert_exists((SELECT
                              lookups FILTER
                                  (std::bit_and(key, .care) = .value)
                          LIMIT
                              1
                          ))
                  SELECT
                      (<std::json>std::assert_exists(<std::json>{
                          name := training.name,
                          status := selected.s,
                          next_step := selected.n
                      }) IF ((collapsed OR NOT (is_rep)) OR is_user_training) ELSE {})
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
