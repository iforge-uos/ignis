CREATE MIGRATION m1ykutbkrx3byqzbwdgx3r43ijot4ciw3krh2cl6ge3ognj2mlelxa
    ONTO m1mozd5inldrdnbotkqylgo3c6yrhrl2iswk5grthre2tsf4eefz7q
{
  SET generated_by := (schema::MigrationGeneratedBy.DDLStatement);
  ALTER TYPE users::User {
      ALTER LINK training {
          CREATE PROPERTY infraction_id: uuid;
      };
  };
};
