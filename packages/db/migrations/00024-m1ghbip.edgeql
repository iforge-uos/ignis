CREATE MIGRATION m1ghbipild36n5qy66mnnkwq2oot2li6gfxsrraravj2m3jbn3c3yq
    ONTO m1rbtjbnsfa4nrdhmrv7uhlrv7q4duea6qbgh45metdldx5qjynslq
{
  ALTER TYPE sign_in::Location {
      DROP INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON (.human_opening_status);
      DROP PROPERTY human_opening_status;
  };
};
