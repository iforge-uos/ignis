CREATE MIGRATION m134yfamagenfvd57ofv73tqnclhacg6ir3qflx6wj62hkhsauhpwq
    ONTO m1rb74armrjwewrnec3ilmuw54vfxicsugdqvmekcz3k2sztdf6hha
{
  ALTER FUNCTION default::notify_webhook(body: std::json) USING (SELECT
      std::net::http::schedule_request('http://localhost:3000/db', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json'), ('Authorization', std::assert_exists(GLOBAL default::PUB_SUB_SECRET, message := 'PUB_SUB_SECRET is not set'))], body := std::to_bytes(body))
  );
  CREATE FUNCTION printing::cdn_url(id: std::uuid) ->  std::str USING (WITH
      root := 
          std::assert_exists(GLOBAL default::CDN_URL, message := 'CDN_URL is not set')
  SELECT
      '\(root)/prints/\(id)/'
  );
  ALTER TYPE printing::Print {
      ALTER PROPERTY gcode_path {
          USING ('\(printing::cdn_url(.id))/.gcode');
      };
      ALTER PROPERTY stl_path {
          USING ('\(printing::cdn_url(.id))/.stl');
      };
  };
  CREATE FUNCTION users::send_infraction(body: std::json) ->  std::net::http::ScheduledRequest USING (SELECT
      std::net::http::schedule_request(std::assert_exists(GLOBAL default::INFRACTIONS_WEBHOOK_URL, message := 'INFRACTIONS_WEBHOOK_URL is not set'), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := std::to_bytes(body))
  );
  ALTER TYPE users::Infraction {
      ALTER TRIGGER log_insert USING (WITH
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
      ALTER TRIGGER log_update USING (SELECT
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
};
