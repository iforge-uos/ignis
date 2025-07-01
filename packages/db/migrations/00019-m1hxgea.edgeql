CREATE MIGRATION m1hxgea276d5m53lz73zcj6f4d7ck2qyijvujzdkfea2gmluno2icq
    ONTO m1ini2uvw55swis7jnd4lcppbacyt6ycajvae2ixh7qe33zja5ymda
{
  CREATE SCALAR TYPE tools::Selectability EXTENDING enum<UNTRAINED, REVOKED, EXPIRED, REPS_UNTRAINED, IN_PERSON_MISSING>;
   ALTER TYPE tools::Tool {
       CREATE REQUIRED PROPERTY quantity: std::int16 {
           SET REQUIRED USING (<std::int16>{});
       };
   };
};
