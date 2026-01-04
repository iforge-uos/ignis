CREATE MIGRATION m1gtczgharmtlmlvvl2khjsiwbzbrndlcgwkczhhhru6dtb5csglvq
    ONTO m1xmuazxsvy77w7vikqz2dao454tkwbeo34wcu6hn5eyzo2izavvga
{
  ALTER TYPE users::User {
      ALTER LINK identity {
          RESET OPTIONALITY;
      };
  };
  ALTER TYPE shop::LineItem {
      CREATE REQUIRED LINK wraps: shop::Item {
          SET REQUIRED USING (<shop::Item>{});
      };
  };
  ALTER TYPE shop::Purchase {
      DROP EXTENDING default::CreatedAt;
      EXTENDING default::Auditable LAST;
  };
};
