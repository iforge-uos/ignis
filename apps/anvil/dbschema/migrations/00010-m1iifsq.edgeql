CREATE MIGRATION m1iifsqgvr2d5hj3z3emnfodrrolxzs4ay3igkv5yav37eyspeof3q
    ONTO m166rnztim2a5mc4742lbdbu73ep5hkqdxs5azn7depjspmcdi5ala
{
  ALTER TYPE sign_in::Reason {
      DROP INDEX ON (.name);
      CREATE REQUIRED PROPERTY active: std::bool {
          SET default := true;
      };
  };
};
