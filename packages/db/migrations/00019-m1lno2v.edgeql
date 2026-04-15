CREATE MIGRATION m1lno2vozlqw34oakzxmdm5fsnz2lelsd66tsr3qfhops7mn5danva
    ONTO m16jycn2gouveamapphqhtgxmi4nycnb6chnrjxhn5zfytrfrx4laq
{
  ALTER TYPE training::Session {
      ALTER ACCESS POLICY allow_reps ALLOW ALL;
  };
  ALTER TYPE users::User {
      CREATE ACCESS POLICY allow_inserts
          ALLOW INSERT USING (true);
  };
};
