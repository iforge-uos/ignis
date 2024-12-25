CREATE MIGRATION m1bknvqlyq63tw3riq3wi5wndtpdxehrcf4yicx2djlielc2ceqvtq
    ONTO m17s7ixztf5mti2zytpcgh5dher62fzcp3uzoxr2qvtlolrip6m74a
{
  ALTER TYPE users::User {
      DROP PROPERTY search_fields;
  };
};
