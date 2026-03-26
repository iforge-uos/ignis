CREATE MIGRATION m1kkagwrcjcs5lui7eggbwpomygmbw4ctrmvfliwuy3aivrlp35ezq
    ONTO m1ppns2llyruympbotb3vjalamvvelncxwh7ownas6v42xocdnvdna
{
  DROP GLOBAL training::COLLAPSED_LOOKUPS;
  CREATE REQUIRED GLOBAL training::COLLAPSED_LOOKUPS := (SELECT
      ((((((((((((((((
          care := default::bin('00_1000_0000'),
          value := default::bin('00_0000_0000'),
          status := training::Status.UNTRAINED,
          next_step := training::NextStep.DO_ONLINE
      ) UNION (
          care := default::bin('00_1000_0010'),
          value := default::bin('00_1000_0010'),
          status := training::Status.REVOKED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('00_1000_0001'),
          value := default::bin('00_1000_0001'),
          status := training::Status.REVOKED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('00_1000_1010'),
          value := default::bin('00_1000_1000'),
          status := training::Status.EXPIRED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('00_1000_0101'),
          value := default::bin('00_1000_0100'),
          status := training::Status.EXPIRED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('10_1010_1111'),
          value := default::bin('00_1000_0000'),
          status := training::Status.ONLINE_COMPLETE,
          next_step := training::NextStep.DO_REP_ONLINE
      )) UNION (
          care := default::bin('10_1111_1111'),
          value := default::bin('10_1000_0000'),
          status := training::Status.ONLINE_COMPLETE,
          next_step := training::NextStep.DO_IN_PERSON_OR_REP_ONLINE
      )) UNION (
          care := default::bin('11_1111_1111'),
          value := default::bin('11_1110_0000'),
          status := training::Status.USER_TRAINING_COMPLETE,
          next_step := training::NextStep.DO_REP_IN_PERSON
      )) UNION (
          care := default::bin('10_1110_1111'),
          value := default::bin('10_1100_0000'),
          status := training::Status.USER_TRAINING_COMPLETE,
          next_step := training::NextStep.DO_REP_ONLINE
      )) UNION (
          care := default::bin('11_1011_1111'),
          value := default::bin('01_1010_0000'),
          status := training::Status.REP_ONLINE_COMPLETE,
          next_step := training::NextStep.DO_REP_IN_PERSON
      )) UNION (
          care := default::bin('11_1111_1111'),
          value := default::bin('11_1010_0000'),
          status := training::Status.REP_ONLINE_COMPLETE,
          next_step := training::NextStep.DO_IN_PERSON_OR_REP_IN_PERSON
      )) UNION (
          care := default::bin('11_1111_1111'),
          value := default::bin('10_1010_0000'),
          status := training::Status.REP_ONLINE_COMPLETE_NO_IN_PERSON,
          next_step := training::NextStep.DO_IN_PERSON
      )) UNION (
          care := default::bin('11_1010_1111'),
          value := default::bin('00_1010_0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      )) UNION (
          care := default::bin('11_1011_1111'),
          value := default::bin('01_1011_0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      )) UNION (
          care := default::bin('11_1110_1111'),
          value := default::bin('10_1110_0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      )) UNION (
          care := default::bin('11_1111_1111'),
          value := default::bin('11_1111_0000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      ))
  );
  DROP GLOBAL training::LOOKUPS;
  CREATE REQUIRED GLOBAL training::LOOKUPS := (SELECT
      ((((((
          care := default::bin('01000'),
          value := default::bin('00000'),
          status := training::Status.UNTRAINED,
          next_step := training::NextStep.DO_ONLINE
      ) UNION (
          care := default::bin('01001'),
          value := default::bin('01001'),
          status := training::Status.REVOKED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('01011'),
          value := default::bin('01010'),
          status := training::Status.EXPIRED,
          next_step := training::NextStep.DO_ONLINE
      )) UNION (
          care := default::bin('11011'),
          value := default::bin('01000'),
          status := training::Status.FULLY_COMPLETE,
          next_step := training::NextStep.NONE
      )) UNION (
          care := default::bin('11111'),
          value := default::bin('11000'),
          status := training::Status.ONLINE_COMPLETE,
          next_step := training::NextStep.DO_IN_PERSON
      )) UNION (
          care := default::bin('11111'),
          value := default::bin('11100'),
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
      (IF (NOT (collapse_) OR is_user_training) THEN std::assert_exists((SELECT
          lookups FILTER
              (std::bit_and(key, .care) = .value)
          ORDER BY
              .value DESC
      LIMIT
          1
      )) ELSE {})
  );
  ALTER TYPE sign_in::SignIn {
      CREATE MULTI LINK _tools: (tools::Tool | tools::GroupedTool);
  };
  ALTER SCALAR TYPE tools::Selectability EXTENDING enum<DO_ONLINE, REVOKED, EXPIRED, DO_IN_PERSON, NONE_REMAINING, DO_IN_PERSON_OR_REP_ONLINE, DO_REP_ONLINE, DO_IN_PERSON_OR_REP_IN_PERSON, DO_REP_IN_PERSON, REPS_UNTRAINED, TOOL_BROKEN, NONE>;
  DROP SCALAR TYPE training::StatusReturn;
};
