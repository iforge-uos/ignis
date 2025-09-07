CREATE MIGRATION m1uuyy7z7l6xneaywt2jfgkfnxy6lxgpi3pgqjrplyymf3tgxr5hkq
    ONTO m1iifsqgvr2d5hj3z3emnfodrrolxzs4ay3igkv5yav37eyspeof3q
{
  ALTER TYPE sign_in::Reason {
      DROP EXTENDING default::CreatedAt;
      EXTENDING default::Auditable LAST;
  };
};
