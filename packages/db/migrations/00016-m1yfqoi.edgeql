CREATE MIGRATION m1yfqoibfk2hn7xjubeecpddyk6yjbpznyxhq3kt2f5vwaj2sb5nxa
    ONTO m1do5ayy3bqbsdnh3gatpqbqw6g32ntvmhg7iyalmhlsfzavcxl6hq
{
  ALTER type sign_in::SignIn {
    ALTER link _tools {
        RENAME TO tools;
    };
  };
};
