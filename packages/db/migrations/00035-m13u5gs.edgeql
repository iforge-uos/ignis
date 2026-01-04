CREATE MIGRATION m13u5gs6crm2y3w6ilcamzy4mwdx5i2n3oxgxfabg43tlul5765iba
    ONTO m1ejgwgo6fnyy5x2xgpap66tnwbp7jy7miazvme4v2wsgbzkbdiguq
{
  ALTER TYPE users::User {
      CREATE LINK identity: ext::auth::Identity {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
