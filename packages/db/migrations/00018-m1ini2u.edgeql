CREATE MIGRATION m1ini2uvw55swis7jnd4lcppbacyt6ycajvae2ixh7qe33zja5ymda
    ONTO m1fwkll4kzxolh55t4miymnu7vp5e5msssp3abri72ihpn7v64huaq
{
  ALTER TYPE training::Session {
      CREATE LINK next_section := (SELECT
          .training.sections FILTER
              (.enabled AND (.index > __source__.index))
          ORDER BY
              .index ASC
      LIMIT
          1
      );
  };
  DROP SCALAR TYPE training::Selectability;
};
