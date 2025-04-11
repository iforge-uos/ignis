CREATE MIGRATION m1bqipkajc4hd4rugp562jjblfmkc63rscwkhieviyjkr6omhbau2a
    ONTO m1li2b224uahlp2qocsx3offnfvfcigilnezdsj4r26or2w4dtugqa
{
  ALTER TYPE ai_rep::Question {
      CREATE INDEX ON (.title) EXCEPT (.rep_only);
  };
};
