CREATE MIGRATION m1pdkqghj24izq3p2465ru2rq777bzqqiyz7hm5ljklqtebhzqwama
    ONTO m1cvlfi4unfhvry3yrqtktivwwypaojjpoj5lybyempqxbracx7zrq
{
  CREATE ALIAS training::Page := (
      training::TrainingPage
  );
};
