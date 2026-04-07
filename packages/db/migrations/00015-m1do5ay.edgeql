CREATE MIGRATION m1do5ayy3bqbsdnh3gatpqbqw6g32ntvmhg7iyalmhlsfzavcxl6hq
    ONTO m16nhciiitg6sowljef35k4532zdfffwvz2nlvabq7aryo3jwv6aqq
{
  ALTER type sign_in::SignIn {
     DROP PROPERTY tools;
  };
};
