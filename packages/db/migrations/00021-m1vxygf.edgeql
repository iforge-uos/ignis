CREATE MIGRATION m1vxygf5dc6sk5apu2ycahhff6pmvtmy6f4ah63fhxdgh2utfcnd2q
    ONTO m14i3wh6xmna73ubmupgzockrb7wsbxgnj2rorvhetvd7jpn2bo7za
{
      ALTER TYPE sign_in::SignIn {
      ALTER PROPERTY signed_out {
          USING (EXISTS (.ends_at));
      };
      ALTER CONSTRAINT std::exclusive ON (.user) EXCEPT (.signed_out) {
          SET errmessage := 'User is currently signed in elsewhere';
      };
  };
};
