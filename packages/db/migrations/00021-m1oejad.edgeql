CREATE MIGRATION m1oejadlv2edv75kovr4wkriem4272nikiowo6gahlg447wqopebia
    ONTO m1pfopzbckom7gf7x4sfixvwaghjl7azogeq3aipkmhgtwnk46dygq
{
  CREATE GLOBAL default::PUB_SUB_WEBHOOK_URL -> std::str;
  ALTER FUNCTION default::notify_webhook(body: std::json) USING (SELECT
      std::net::http::schedule_request(std::assert_exists(GLOBAL default::PUB_SUB_WEBHOOK_URL, message := 'PUB_SUB_WEBHOOK_URL is not set'), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json'), ('Authorization', std::assert_exists(GLOBAL default::PUB_SUB_SECRET, message := 'PUB_SUB_SECRET is not set'))], body := std::to_bytes(body))
  );
};
