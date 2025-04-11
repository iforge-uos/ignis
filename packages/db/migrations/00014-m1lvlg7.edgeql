CREATE MIGRATION m1lvlg7tn6q53qu4gau6alud6cfiszi5ntbcxairy4sndhtxhnlzrq
    ONTO m1kh5wprsqd4uc336x5yybilcbejw3h7wk5bakrst2nginmvqvtbkq
{
  ALTER TYPE ai_rep::Question {
      ALTER ACCESS POLICY user_is_rep USING ((NOT (.rep_only) AND EXISTS (({'Rep', 'Incoming Rep'} INTERSECT (GLOBAL default::user).roles.name))));
  };
};
