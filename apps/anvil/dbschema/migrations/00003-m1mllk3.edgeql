CREATE MIGRATION m1mllk3j56vsoduj37tafgm6ezegbjunwqw5sss5m26lpyukdnevma
    ONTO m1an6r72qhom2wv2rrtoa45s7kwxykawcjrnr6hm7iq7hsiugxcava
{
  ALTER TYPE sign_in::QueuePlace {
      DROP PROPERTY can_sign_in;
  };
  ALTER TYPE sign_in::QueuePlace {
      CREATE PROPERTY can_sign_in_until: std::datetime {
          CREATE ANNOTATION std::description := 'The time the user can sign in until.';
      };
  };
  ALTER TYPE sign_in::QueuePlace {
      CREATE PROPERTY notified_at: std::datetime {
          CREATE ANNOTATION std::description := 'The time the user was emailed that they have a slot.';
      };
  };
  ALTER TYPE sign_in::QueuePlace {
      DROP PROPERTY position;
  };
};
