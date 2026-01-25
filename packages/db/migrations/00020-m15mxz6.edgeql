CREATE MIGRATION m15mxz6k5noylgh5ciacghn4bb5jsf5fvjqli3g446kthqjh43yofa
    ONTO m1hoo2h2524gppemugvzye5f55fsnq5dblq2gwzibgbumxygovvsnq
{
  DROP FUNCTION training::get_statuses(user: users::User, NAMED ONLY collapsed: std::bool);
  DROP GLOBAL training::COLLAPSED_LOOKUPS;
  CREATE REQUIRED GLOBAL training::COLLAPSED_LOOKUPS := (SELECT
      (((((((((((((((
          care := default::bin('0_0000_1000'),
          value := default::bin('0_0000_1000'),
          status := training::Status.REVOKED,
          next_step := training::NextStep.DO_ONLINE
      ) UNION (
          care := default::bin('0_0000_0010'),
          value := default::bin('0_0000_0010'),
          status := training::Status.REVOKED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('0_0001_1010'),
          value := default::bin('0_0001_0010'),
          status := training::Status.EXPIRED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('0_0000_1110'),
          value := default::bin('0_0000_1100'),
          status := training::Status.EXPIRED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('1_0000_1111'),
          value := default::bin('0_0000_0000'),
          status := training::Status.ONLINE_COMPLETE,
          next_step := training::NextStep.DO_REP_ONLINE
      )) UNION (
          care := default::bin('1_0110_1111'),
          value := default::bin('1_0000_0000'),
          status := training::Status.ONLINE_COMPLETE,
          next_step := training::NextStep.DO_IN_PERSON_OR_REP_ONLINE
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1110_0000'),
          status := training::Status.USER_TRAINING_COMPLETE,
          next_step := training::NextStep.DO_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_0110_1111'),
          value := default::bin('1_0100_0000'),
          status := training::Status.USER_TRAINING_COMPLETE,
          next_step := training::NextStep.DO_REP_ONLINE
      )) UNION (
          care := default::bin('1_1011_1111'),
          value := default::bin('0_1010_0000'),
          status := training::Status.REP_ONLINE_COMPLETE,
          next_step := training::NextStep.DO_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1010_0000'),
          status := training::Status.REP_ONLINE_COMPLETE,
          next_step := training::NextStep.DO_IN_PERSON_OR_REP_IN_PERSON
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_0010_0000'),
          status := training::Status.REP_ONLINE_COMPLETE_NO_IN_PERSON,
          next_step := training::NextStep.DO_IN_PERSON
      )) UNION (
          care := default::bin('1_1010_1111'),
          value := default::bin('0_0010_0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1011_1111'),
          value := default::bin('0_1011_0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1110_1111'),
          value := default::bin('1_0110_0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      )) UNION (
          care := default::bin('1_1111_1111'),
          value := default::bin('1_1111_0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      ))
  );
  DROP GLOBAL training::LOOKUPS;
  CREATE REQUIRED GLOBAL training::LOOKUPS := (SELECT
      (((((
          care := default::bin('0001'),
          value := default::bin('0001'),
          status := training::Status.REVOKED,
          next_step := training::NextStep.DO_ONLINE
      ) UNION (
          care := default::bin('0011'),
          value := default::bin('0010'),
          status := training::Status.EXPIRED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('1011'),
          value := default::bin('0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      )) UNION (
          care := default::bin('1011'),
          value := default::bin('1000'),
          status := training::Status.ONLINE_COMPLETE,
          next_step := training::NextStep.DO_IN_PERSON
      )) UNION (
          care := default::bin('1111'),
          value := default::bin('1100'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      ))
  );
  CREATE FUNCTION training::get_status(training: training::Training, user: users::User, NAMED ONLY collapse: std::bool = true) -> OPTIONAL tuple<care: std::int64, value: std::int64, status: training::Status, next_step: training::NextStep> USING (WITH
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
              (default::bin(((((((((('1' IF training_in_person_needed ELSE '0') ++ ('1' IF rep_in_person_needed ELSE '0')) ++ ('1' IF training_in_person_done ELSE '0')) ++ ('1' IF rep_online ELSE '0')) ++ ('1' IF rep_in_person_done ELSE '0')) ++ ('1' IF training_expired ELSE '0')) ++ ('1' IF rep_expired ELSE '0')) ++ ('1' IF training_revoked ELSE '0')) ++ ('1' IF rep_revoked ELSE '0'))) IF collapse_ ELSE default::bin((((('1' IF training_in_person_needed ELSE '0') ++ ('1' IF training_in_person_done ELSE '0')) ++ ('1' IF training_expired ELSE '0')) ++ ('1' IF training_revoked ELSE '0'))))
          )
      ,
      lookups := 
          (GLOBAL training::COLLAPSED_LOOKUPS IF collapse_ ELSE GLOBAL training::LOOKUPS)
  SELECT
      (IF (NOT (collapse_) OR is_user_training) THEN std::assert_exists((SELECT
          lookups FILTER
              (std::bit_and(key, .care) = .value)
          ORDER BY
              .value DESC
      LIMIT
          1
      )) ELSE {})
  );
  DROP SCALAR TYPE training::StatusReturn;
};
