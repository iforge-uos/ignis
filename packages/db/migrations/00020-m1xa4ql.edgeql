CREATE MIGRATION m1xa4ql5a5yeci7grm6ipelnjoe3tjgvbvvhk3nvrjhm7wzitjuoda
    ONTO m1v6kzunketn37lrqnbc5zaz4xzya2e2v5knzne6qdw4kkxs55e4sq
{
  ALTER FUNCTION default::notify_webhook(body: std::json) USING (SELECT
      std::net::http::schedule_request('http://localhost:3002', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := std::to_bytes(body))
  );
  ALTER TYPE shop::Item {
      ALTER LINK skews {
          RESET EXPRESSION;
          RESET EXPRESSION;
          SET REQUIRED USING (<shop::Skew>{});
          SET TYPE shop::Skew;
      };
      CREATE MULTI LINK tools: tools::Tool {
          CREATE ANNOTATION std::description := 'Tools that can use this item';
      };
  };
  ALTER TYPE shop::Skew {
      ALTER LINK item {
          USING (std::assert_exists(std::assert_single(shop::Item FILTER
              (__source__ IN .skews)
          )));
      };
  };
  ALTER TYPE shop::dimensions::ISO216 {
      CREATE PROPERTY thickness: std::float64;
      ALTER PROPERTY formatted {
          USING (SELECT
              ('\(.unit)\(.size) - \(std::assert_exists(.thickness))mm' IF EXISTS (.thickness) ELSE '\(.unit)\(.size)')
          );
      };
  };
  CREATE TYPE shop::dimensions::ThreadedBar EXTENDING shop::Dimension {
      CREATE REQUIRED PROPERTY diameter: std::int64;
      CREATE REQUIRED PROPERTY length: std::int64;
      CREATE REQUIRED PROPERTY unit := ('mm');
      CREATE REQUIRED PROPERTY formatted := ('M\(.diameter) x \(.length)\(.unit)');
  };
};
