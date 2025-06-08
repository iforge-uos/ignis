CREATE MIGRATION m1li2b224uahlp2qocsx3offnfvfcigilnezdsj4r26or2w4dtugqa
    ONTO m1lvlg7tn6q53qu4gau6alud6cfiszi5ntbcxairy4sndhtxhnlzrq
{
  ALTER TYPE ai_rep::Question {
      DROP ACCESS POLICY user_is_rep;
  };
};
