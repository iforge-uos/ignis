CREATE MIGRATION m1rbtjbnsfa4nrdhmrv7uhlrv7q4duea6qbgh45metdldx5qjynslq
    ONTO m1ooaa7sp2iurcu2t2g3rpix56mbjxhily3ugqmjz7463ace3zte3a
{
  ALTER TYPE sign_in::Location {
      CREATE REQUIRED PROPERTY human_opening_status := ('\n            Name: \\(str_title(.name))\n            Days open: \\(.opening_days)\n            Opens: \\(.opening_time)\n            Closes: \\(.closing_time)\n        ');
      CREATE DEFERRED INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON (.human_opening_status);
  };
};
