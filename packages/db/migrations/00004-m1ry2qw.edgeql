CREATE MIGRATION m1ry2qwuzmxvftcs2tizap6chn5zhoajyfqroezglbk4biiebeu27q
    ONTO m1oe5cn4pqitfdcqmozsldmfspzs4roxoatspra5m4qtqtwoaqrbka
{
          ALTER TYPE users::User {
      ALTER LINK agreements_signed {
          ALTER PROPERTY version_signed {
              SET default := (__source__.version);
          };
      };
  };
};
