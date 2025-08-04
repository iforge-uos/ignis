CREATE MIGRATION m1b6ansbmppb66fsybb4k37q4xrlwqv3iyk2tqe5wgvwxftsjqtmjq
    ONTO m1iu5v5cgxusedbtxsrcsensahqtlxgqu5pthklb7ccyds5isv7ohq
{
  ALTER TYPE sign_in::Location {
      DROP INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON ('\n            Name: \(std::str_title(<std::str>.name))\n            Opens: \(.opening_time)\n            Closes: \(.closing_time)\n        ');
  };
  ALTER TYPE sign_in::Location {
      CREATE DEFERRED INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON ('\nName: \(std::str_title(<std::str>.name))\nOpening time: \(.opening_time)\nClosing time: \(.closing_time)\n        ');
      DROP PROPERTY _str_opening_days;
  };
};
