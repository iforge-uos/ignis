CREATE MIGRATION m1v6kzunketn37lrqnbc5zaz4xzya2e2v5knzne6qdw4kkxs55e4sq
    ONTO m1sbcgktcm2ltyfuj6gxhwfu56yg72pfuyhcr3t453ymkb7umodwva
{
  CREATE FUNCTION default::notify_webhook(body: std::json) ->  std::net::http::ScheduledRequest USING (SELECT
      std::net::http::schedule_request('http://localhost:3001', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := std::to_bytes(body))
  );
  ALTER TYPE default::Listenable {
      DROP TRIGGER send_delete;
  };
  ALTER TYPE default::Listenable {
      DROP TRIGGER send_insert;
  };
  CREATE ABSTRACT TYPE default::_BaseListenable {
      CREATE TRIGGER send_delete
          AFTER DELETE 
          FOR EACH DO (default::notify_webhook(<std::json>{
              type := __old__.__type__.name,
              action := 'delete',
              id := __old__.id
          }));
      CREATE TRIGGER send_insert
          AFTER INSERT 
          FOR EACH DO (default::notify_webhook(<std::json>{
              type := __new__.__type__.name,
              action := 'insert',
              id := __new__.id
          }));
  };
  ALTER TYPE default::Listenable EXTENDING default::_BaseListenable LAST;
  CREATE ABSTRACT TYPE default::ListenableWithChanges EXTENDING default::_BaseListenable {
      CREATE TRIGGER send_update
          AFTER UPDATE 
          FOR EACH DO (WITH
              old_values := 
                  std::json_object_unpack(<std::json>__old__ {
                      **
                  })
              ,
              new := 
                  <std::json>__new__ {
                      **
                  }
              ,
              changes := 
                  (FOR entry IN old_values
                  UNION 
                      (WITH
                          key := 
                              entry.0
                          ,
                          value := 
                              entry.1
                          ,
                          new_value := 
                              std::json_get(new, key)
                      SELECT
                          (key, (<std::json>{
                              old := value,
                              new := new_value
                          } IF (value != new_value) ELSE {}))
                      ))
          SELECT
              default::notify_webhook(<std::json>{
                  type := __new__.__type__.name,
                  action := 'update',
                  id := __new__.id,
                  fields_changed := std::json_object_pack(changes)
              })
          );
  };
  ALTER TYPE default::Listenable {
      ALTER TRIGGER send_update USING (default::notify_webhook(<std::json>{
          type := __new__.__type__.name,
          action := 'update',
          id := __new__.id
      }));
  };
  ALTER TYPE sign_in::Agreement EXTENDING default::ListenableWithChanges LAST;
  ALTER TYPE sign_in::Location EXTENDING default::ListenableWithChanges LAST;
  ALTER TYPE sign_in::SignIn EXTENDING default::Listenable LAST;
  ALTER TYPE users::User EXTENDING default::Listenable LAST;
  ALTER TYPE users::Infraction {
      ALTER TRIGGER log_insert USING (std::net::http::schedule_request(std::assert_exists(GLOBAL default::INFRACTIONS_WEBHOOK_URL), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := (WITH
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
          std::to_bytes(<std::json>{
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
      )));
      CREATE TRIGGER log_update
          AFTER UPDATE 
          FOR EACH DO (std::net::http::schedule_request(std::assert_exists(GLOBAL default::INFRACTIONS_WEBHOOK_URL), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := std::to_bytes(<std::json>{
              embeds := [{
                  title := 'User Infraction Updated for \(__new__.user.display_name)',
                  description := ((('Type: \(__new__.type)\n' ++ 'Reason: \(__new__.reason)\n') ++ 'Resolved: \(__new__.resolved)\n\n') ++ ('Ends <t:\(std::datetime_get(__new__.ends_at, 'epochseconds'))>' IF EXISTS (__new__.duration) ELSE '')),
                  color := 10953233,
                  url := 'https://iforge.sheffield.ac.uk/users/\(__new__.user.id)',
                  thumbnail := {
                      url := __new__.user.profile_picture
                  }
              }]
          })));
  };
};
