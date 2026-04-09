CREATE MIGRATION m1e3ncebrxgycs2qaa5oweci55cex2bs6kmsquklfehwuj2b2zyu4q
    ONTO m1yfqoibfk2hn7xjubeecpddyk6yjbpznyxhq3kt2f5vwaj2sb5nxa
{
  ALTER TYPE sign_in::Reason EXTENDING default::Listenable LAST;
};
