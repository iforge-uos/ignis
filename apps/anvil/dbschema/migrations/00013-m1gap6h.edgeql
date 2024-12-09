CREATE MIGRATION m1gap6hvgbagbmjnjd6bejcnanoam2ihhhhi5iv6bhto6efgbdu5xa
    ONTO m1ykutbkrx3byqzbwdgx3r43ijot4ciw3krh2cl6ge3ognj2mlelxa
{
  ALTER TYPE users::User {
      ALTER LINK training {
          ALTER PROPERTY infraction_id {
              RENAME TO infraction;
          };
      };
  };
};
