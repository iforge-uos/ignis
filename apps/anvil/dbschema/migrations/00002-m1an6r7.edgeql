CREATE MIGRATION m1an6r72qhom2wv2rrtoa45s7kwxykawcjrnr6hm7iq7hsiugxcava
    ONTO m1eewyk2vcv4ym43hugslnzjyodkwuda4sia35yf764hsqyddocazq
{
          ALTER TYPE training::Training {
      ALTER LINK sections {
          USING (SELECT
              (.pages UNION .questions)
          ORDER BY
              .index ASC
          );
      };
  };
  ALTER TYPE training::Interactable {
      DROP CONSTRAINT std::exclusive ON ((.parent, .index));
      DROP LINK parent;
  };
};
