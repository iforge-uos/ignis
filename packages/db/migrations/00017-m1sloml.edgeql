CREATE MIGRATION m1slomliw242xhorg24rzhroj2pud4e6i2ecwtvrwggns6tmdhgd4a
    ONTO m17tvaw5sw4cxr4g2jnqkm7nocrq6qv6b57z45dzvbuptdjqunkapq
{
  ALTER TYPE users::Infraction {
      ALTER TRIGGER log_insert USING (std::net::http::schedule_request(std::assert_exists(GLOBAL default::INFRACTIONS_WEBHOOK_URL), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := std::to_bytes(<std::str>std::json_object_pack({('embeds', <std::json>[std::json_object_pack({('title', <std::json>'User Infraction Added to \(__new__.user.display_name)'), ('description', <std::json>((('Type: \(__new__.type)\n' ++ 'Reason: \(__new__.reason)\n') ++ 'Resolved: \(__new__.resolved)\n\n') ++ ('Ends <t:\(std::datetime_get(__new__.ends_at, 'epochseconds'))>' IF EXISTS (__new__.duration) ELSE ''))), ('color', <std::json>10953233), ('url', <std::json>'https://iforge.sheffield.ac.uk/users/\(__new__.user.id)'), ('thumbnail', std::json_object_pack({('url', <std::json>__new__.user.profile_picture)}))})])}))));
  };
};
