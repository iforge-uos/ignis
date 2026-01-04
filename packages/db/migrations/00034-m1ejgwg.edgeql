CREATE MIGRATION m1ejgwgo6fnyy5x2xgpap66tnwbp7jy7miazvme4v2wsgbzkbdiguq
    ONTO m1gtczgharmtlmlvvl2khjsiwbzbrndlcgwkczhhhru6dtb5csglvq
{
  SET generated_by := (schema::MigrationGeneratedBy.DDLStatement);
  ALTER TYPE users::User {
      DROP LINK identity;
  };
};
