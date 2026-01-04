CREATE MIGRATION m1rb74armrjwewrnec3ilmuw54vfxicsugdqvmekcz3k2sztdf6hha
    ONTO m13u5gs6crm2y3w6ilcamzy4mwdx5i2n3oxgxfabg43tlul5765iba
{
  ALTER GLOBAL default::user USING (std::assert_single((SELECT
      users::User
  FILTER
      (.identity = GLOBAL ext::auth::ClientTokenIdentity)
  )));
};
