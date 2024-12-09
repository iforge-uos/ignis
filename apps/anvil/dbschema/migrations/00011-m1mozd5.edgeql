CREATE MIGRATION m1mozd5inldrdnbotkqylgo3c6yrhrl2iswk5grthre2tsf4eefz7q
    ONTO m15m3doao6wp3vdn5kb4tomine3to27h5u62psbz6wvfompuds3m6q
{
  ALTER TYPE users::User {
      DROP LINK infractionf;
  };
};
