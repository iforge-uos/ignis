CREATE MIGRATION m1bputumaiigrhbap7r6tuxcoshrky2fyuhp6ydru7qe2e3ajucxmq
    ONTO m1mllk3j56vsoduj37tafgm6ezegbjunwqw5sss5m26lpyukdnevma
{
  ALTER TYPE sign_in::QueuePlace {
      ALTER PROPERTY can_sign_in_until {
          USING ((.notified_at + <cal::relative_duration>'15m'));
          DROP ANNOTATION std::description;
      };
  };
};
