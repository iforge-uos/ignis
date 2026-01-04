CREATE MIGRATION m1kigxdudfuxithqerfbfkenlfflukqktzfppcdvwule6tkdudmq7q
    ONTO m1ikdcrwzylzh3ulpp4mq3raxll7bernaoslrr3cshz7lncw6vjkva
{
  CREATE GLOBAL default::PUB_SUB_SECRET -> std::str;
  ALTER FUNCTION default::notify_webhook(body: std::json) USING (SELECT
      std::net::http::schedule_request('http://localhost:3000/db', method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json'), ('Authorization', std::assert_exists(GLOBAL default::PUB_SUB_SECRET))], body := std::to_bytes(body))
  );
};
