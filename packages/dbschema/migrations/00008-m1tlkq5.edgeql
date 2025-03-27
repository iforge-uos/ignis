CREATE MIGRATION m1tlkq5yfhdeom3h3jk2lcxgxohptcbzro2wxptvw25qdge64kev3q
    ONTO m1la7rtne4n5y4jrnopm66u3rgmdzezyk6qytnkrswlejmf3vrtghq
{
  ALTER TYPE sign_in::Location {
      ALTER PROPERTY can_sign_in {
          USING (SELECT
              (std::count(.sign_ins) < .max_count)
          );
      };
  };
};
