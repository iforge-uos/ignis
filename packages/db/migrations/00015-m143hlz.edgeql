CREATE MIGRATION m143hlzpfan3d4zix4z52davcazexfo74s7bashrsjxln5a35wmxba
    ONTO m1zaucx7hwvbga4qy4bq5mgl6rvhzq5py4c5fcwbxsfsvw7cygxpoa
{
  ALTER TYPE users::Infraction {
      ALTER TRIGGER log_insert USING (std::net::http::schedule_request(std::assert_exists(GLOBAL default::INFRACTIONS_WEBHOOK_URL), method := std::net::http::Method.POST, headers := [('Content-Type', 'application/json')], body := <std::bytes>std::json_object_pack({('embeds', std::json_object_pack({('title', <std::json>'User Infraction Added to \(__new__.user.display_name)'), ('description', <std::json>'\n                        Type: \\(to_str(__new__.type))\n                        Reason: \\(__new__.reason)\n                        Resolved: \\(to_str(__new__.resolved))\n                        \\(\n                            "Ends <t:\\(datetime_get(__new__.ends_at, "epochseconds"))>"\n                            if exists __new__.duration\n                            else ""\n                        )'), ('color', <std::json>10953233), ('url', <std::json>'https://iforge.sheffield.ac.uk/users/\(__new__.user.id)'), ('thumbnail', std::json_object_pack({('url', <std::json>__new__.user.profile_picture)}))}))})));
  };
};
