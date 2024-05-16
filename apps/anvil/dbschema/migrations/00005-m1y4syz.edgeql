CREATE MIGRATION m1y4syzxau4bu5bf5wwyljia5yk7mko5zols7njg4cy7vrgmhbbuiq
    ONTO m1bputumaiigrhbap7r6tuxcoshrky2fyuhp6ydru7qe2e3ajucxmq
{
      ALTER TYPE sign_in::QueuePlace {
      ALTER PROPERTY can_sign_in_until {
          RENAME TO ends_at;
      };
  };
};
