CREATE MIGRATION m1oe5cn4pqitfdcqmozsldmfspzs4roxoatspra5m4qtqtwoaqrbka
    ONTO m1xhcm22vg4cf7snia6zm5a3ork72zzjtuvweiivwl2lj7wzioqnya
{
          ALTER TYPE users::User {
      ALTER LINK agreements_signed {
          CREATE PROPERTY version_signed: std::int16;
      };
  };
};
