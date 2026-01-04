CREATE MIGRATION m1zaucx7hwvbga4qy4bq5mgl6rvhzq5py4c5fcwbxsfsvw7cygxpoa
    ONTO m1ghznmz7p545pvf5lqsco6kfg22hvjemfqsywb2vcu5v6sixpvkla
{
  CREATE ABSTRACT TYPE default::Listenable {
      CREATE TRIGGER send_delete
          AFTER DELETE 
          FOR EACH DO (std::net::http::schedule_request('http://localhost:3001', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := (SELECT
              <std::bytes><std::json>{
                  type := __old__.__type__.name,
                  action := 'delete',
                  id := __old__.id
              }
          )));
      CREATE TRIGGER send_insert
          AFTER INSERT 
          FOR EACH DO (std::net::http::schedule_request('http://localhost:3001', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := (SELECT
              <std::bytes><std::json>{
                  type := __new__.__type__.name,
                  action := 'insert',
                  id := __new__.id
              }
          )));
      CREATE TRIGGER send_update
          AFTER UPDATE 
          FOR EACH DO (std::net::http::schedule_request('http://localhost:3001', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := (SELECT
              <std::bytes><std::json>{
                  type := __new__.__type__.name,
                  action := 'update',
                  id := __new__.id
              }
          )));
  };
  ALTER TYPE event::Event {
      CREATE REQUIRED LINK location: sign_in::Location {
          SET REQUIRED USING (<sign_in::Location>{});
      };
      CREATE REQUIRED MULTI LINK required_training: training::Training {
          SET REQUIRED USING (<training::Training>{});
      };
  };
  ALTER TYPE notification::Notification {
      CREATE MULTI PROPERTY attachments: std::str {
          CREATE ANNOTATION std::description := 'The paths for the attachments to be uploaded on the CDN e.g. attachments/{id}.';
      };
  };
  ALTER TYPE users::Infraction {
      CREATE TRIGGER log_insert
          AFTER INSERT 
          FOR EACH DO (std::net::http::schedule_request(std::assert_exists(GLOBAL default::INFRACTIONS_WEBHOOK_URL), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := <std::bytes><std::json>{
              embeds := [{
                  title := 'User Infraction Added to \(__new__.user.display_name)',
                  description := '\n                        Type: \\(to_str(__new__.type))\n                        Reason: \\(__new__.reason)\n                        Resolved: \\(to_str(__new__.resolved))\n                        \\(\n                            "Ends <t:\\(datetime_get(__new__.ends_at, "epochseconds"))>"\n                            if exists __new__.duration\n                            else ""\n                        )',
                  color := 10953233,
                  url := 'https://iforge.sheffield.ac.uk/users/\(__new__.user.id)',
                  thumbnail := {
                      url := __new__.user.profile_picture
                  }
              }]
          }));
  };
  ALTER SCALAR TYPE team::Name EXTENDING enum<IT, `3DP`, Hardware, Publicity, Events, Relations, Operations, `Recruitment & Development`, `Health & Safety`, Inclusions, Sustainability, `Unsorted Reps`, `Future Reps`, Staff>;
};
