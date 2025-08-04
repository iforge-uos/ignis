CREATE MIGRATION m1iu5v5cgxusedbtxsrcsensahqtlxgqu5pthklb7ccyds5isv7ohq
    ONTO m1ghbipild36n5qy66mnnkwq2oot2li6gfxsrraravj2m3jbn3c3yq
{
  ALTER TYPE sign_in::Location {
      CREATE DEFERRED INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON ('\n            Name: \(std::str_title(<std::str>.name))\n            Opens: \(.opening_time)\n            Closes: \(.closing_time)\n        ');
      CREATE REQUIRED PROPERTY _str_opening_days := ((<std::str>.opening_days ?? 'Not currently open check our Instagram for more'));
  };
};
