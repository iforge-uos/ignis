CREATE MIGRATION m122ougyyaxzwvfcbtb4q5wbfrnjucjfazbmt26zhdyjysmykmqb7a
    ONTO m1o6hgafzumupv6m3kw5tte2vmmlll3xhkt7kodwvzz5np7iyt7mtq
{
  ALTER TYPE users::User {
      ALTER LINK agreements_signed {
          ALTER PROPERTY version_signed {
              RESET default;
          };
      };
  };
};
