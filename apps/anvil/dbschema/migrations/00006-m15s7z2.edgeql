CREATE MIGRATION m15s7z2fb455l76yb6cc3pod3umov4jukbm75xy6d3u5y3yty3dpjq
    ONTO m1nzppmd2hd3hs4glv3tthtuf7vpfjybion47332hityyrwsxeqgwa
{
  ALTER TYPE sign_in::Location {
      ALTER LINK supervisable_training {
          USING (SELECT
              DISTINCT (.supervising_reps.supervisable_training)
          FILTER
              (<training::LocationName><std::str>__source__.name IN .locations)
          );
      };
  };
};
