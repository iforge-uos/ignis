CREATE MIGRATION m17e2u7yo64hdudtuxx2dssutwwa6exjts4ea55vs623xgnvl2asoq
    ONTO m1qb4x2zuzk5uqgw7p355fcxdblrcsn45ukn3fnhwcaho7y52y2rzq
{
  ALTER TYPE sign_in::Agreement {
      CREATE REQUIRED PROPERTY name: std::str {
          SET REQUIRED USING ('MISSING');
      };
  };
};
