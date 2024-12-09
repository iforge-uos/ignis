CREATE MIGRATION m15m3doao6wp3vdn5kb4tomine3to27h5u62psbz6wvfompuds3m6q
    ONTO m1siq6wvdkeukxszitojmhhdwuwq5jd6ii2sl4577hc2sffvwg65nq
{
  ALTER TYPE users::User {
      ALTER LINK infraction {
          RENAME TO infractionf;
      };
  };
};
