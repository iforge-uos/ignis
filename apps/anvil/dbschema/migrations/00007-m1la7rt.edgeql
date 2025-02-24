CREATE MIGRATION m1la7rtne4n5y4jrnopm66u3rgmdzezyk6qytnkrswlejmf3vrtghq
    ONTO m122ougyyaxzwvfcbtb4q5wbfrnjucjfazbmt26zhdyjysmykmqb7a
{
  ALTER TYPE users::User {
      ALTER LINK infractions {
          USING (.<user[IS users::Infraction]);
      };
  };
};
