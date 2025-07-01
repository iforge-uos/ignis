CREATE MIGRATION m14i3wh6xmna73ubmupgzockrb7wsbxgnj2rorvhetvd7jpn2bo7za
    ONTO m1hxgea276d5m53lz73zcj6f4d7ck2qyijvujzdkfea2gmluno2icq
{
  ALTER TYPE event::Event {
      ALTER LINK attendees {
          ALTER PROPERTY registered_at {
              RENAME TO created_at;
          };
      };
  };
  ALTER TYPE event::Event {
      ALTER LINK interested {
          ALTER PROPERTY registered_at {
              RENAME TO created_at;
          };
      };
  };
};
