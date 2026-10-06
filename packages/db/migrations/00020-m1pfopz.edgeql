CREATE MIGRATION m1pfopzbckom7gf7x4sfixvwaghjl7azogeq3aipkmhgtwnk46dygq
    ONTO m1lno2vozlqw34oakzxmdm5fsnz2lelsd66tsr3qfhops7mn5danva
{
  ALTER TYPE users::Infraction {
      DROP TRIGGER log_insert;
  };
  ALTER TYPE users::Infraction {
      DROP TRIGGER log_update;
  };
  DROP FUNCTION users::send_infraction(body: std::json);
  CREATE FUNCTION users::send_infraction(body: std::json) -> OPTIONAL std::net::http::ScheduledRequest USING (SELECT
      (std::net::http::schedule_request(std::assert_exists(GLOBAL default::INFRACTIONS_WEBHOOK_URL), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := std::to_bytes(body)) IF EXISTS (GLOBAL default::INFRACTIONS_WEBHOOK_URL) ELSE <std::net::http::ScheduledRequest>{})
  );
  ALTER TYPE users::Infraction {
      CREATE TRIGGER log_insert
          AFTER INSERT 
          FOR EACH DO (WITH
              sign_in := 
                  (SELECT
                      __new__.user.sign_ins FILTER
                          NOT (.signed_out)
                  LIMIT
                      1
                  )
              ,
              supervising_reps := 
                  sign_in.location.supervising_reps
          SELECT
              users::send_infraction(<std::json>{
                  embeds := [{
                      title := 'User Infraction Added to \(__new__.user.display_name)',
                      description := (((('Type: \(__new__.type)\n' ++ 'Reason: \(__new__.reason)\n') ++ 'Supervising Reps: \(std::array_join(std::array_agg(supervising_reps.display_name), ', '))\n') ++ 'Resolved: \(__new__.resolved)\n\n') ++ ('Ends <t:\(std::datetime_get(__new__.ends_at, 'epochseconds'))>' IF EXISTS (__new__.duration) ELSE '')),
                      color := 10953233,
                      url := 'https://iforge.sheffield.ac.uk/users/\(__new__.user.id)',
                      thumbnail := {
                          url := __new__.user.profile_picture
                      }
                  }]
              })
          );
  };
  ALTER TYPE users::Infraction {
      CREATE TRIGGER log_update
          AFTER UPDATE 
          FOR EACH DO (SELECT
              users::send_infraction(<std::json>{
                  embeds := [{
                      title := 'User Infraction Updated for \(__new__.user.display_name)',
                      description := ((('Type: \(__new__.type)\n' ++ 'Reason: \(__new__.reason)\n') ++ 'Resolved: \(__new__.resolved)\n\n') ++ ('Ends <t:\(std::datetime_get(__new__.ends_at, 'epochseconds'))>' IF EXISTS (__new__.duration) ELSE '')),
                      color := 10953233,
                      url := 'https://iforge.sheffield.ac.uk/users/\(__new__.user.id)',
                      thumbnail := {
                          url := __new__.user.profile_picture
                      }
                  }]
              })
          );
  };
  ALTER SCALAR TYPE notification::DeliveryMethod EXTENDING enum<BANNER, EMAIL, TRAY, POPUP>;
  ALTER SCALAR TYPE users::Platform EXTENDING enum<GITHUB>;
};
