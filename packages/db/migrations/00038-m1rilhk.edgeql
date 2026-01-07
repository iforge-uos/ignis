CREATE MIGRATION m1rilhkudsrkzymemr2c2sexsqbraamhhbzv5ninh7ynz4vkuiuguq
    ONTO m134yfamagenfvd57ofv73tqnclhacg6ir3qflx6wj62hkhsauhpwq
{
  CREATE MODULE dimensions IF NOT EXISTS;
  ALTER FUNCTION default::notify_webhook(body: std::json) USING (SELECT
      std::net::http::schedule_request('http://localhost:3000/api/db/webhook', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json'), ('Authorization', std::assert_exists(GLOBAL default::PUB_SUB_SECRET, message := 'PUB_SUB_SECRET is not set'))], body := std::to_bytes(body))
  );
  ALTER TYPE shop::Dimension RENAME TO dimensions::Dimension;
  ALTER TYPE shop::dimensions::Cuboid RENAME TO dimensions::Cuboid;
  ALTER TYPE shop::dimensions::Cylindrical RENAME TO dimensions::Cylindrical;
  ALTER TYPE shop::dimensions::ISO216 RENAME TO dimensions::ISO216;
  ALTER TYPE shop::dimensions::LiquidVolume RENAME TO dimensions::LiquidVolume;
  ALTER TYPE shop::dimensions::Mass RENAME TO dimensions::Mass;
  ALTER TYPE shop::dimensions::Thread RENAME TO dimensions::Thread;
  ALTER TYPE tools::Booking {
      DROP ACCESS POLICY is_bookable;
  };
  CREATE TYPE tools::GroupedTool {
      CREATE REQUIRED MULTI LINK tools: tools::Tool;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE tools::Tool {
      CREATE REQUIRED PROPERTY grouped: std::bool {
          SET default := false;
          CREATE ANNOTATION std::description := '\n                Whether this tool is grouped with another e.g. the metal pillar drill and the wood pillar drill and the wooden one\n            ';
      };
  };
  ALTER TYPE tools::GroupedTool {
      CREATE TRIGGER check_grouped
          AFTER UPDATE, INSERT 
          FOR EACH DO (std::assert(std::all(__new__.tools.grouped), message := 'All tools in a GroupedTool must have grouped := true'));
  };
  ALTER TYPE tools::Tool {
      CREATE MULTI LINK responsible_reps: users::Rep;
  };
  ALTER TYPE tools::Tool {
      CREATE MULTI PROPERTY bookable_hours: std::cal::local_time {
          CREATE ANNOTATION std::description := '\n                Empty means any time the location is open (or not bookable).\n            ';
      };
  };
  ALTER TYPE tools::Tool {
      DROP PROPERTY status;
  };
  ALTER SCALAR TYPE tools::Status EXTENDING enum<NOMINAL, IN_USE, PARTIALLY_FUNCTIONAL, OUT_OF_ORDER>;
  DROP MODULE shop::dimensions;
};
