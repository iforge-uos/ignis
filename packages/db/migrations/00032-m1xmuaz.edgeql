CREATE MIGRATION m1xmuazxsvy77w7vikqz2dao454tkwbeo34wcu6hn5eyzo2izavvga
    ONTO m1na7dg3b42booribg5r6vfa3hvlpxaitcybbye2ou3kb5tpoed6ca
{
  ALTER TYPE shop::Skew {
      ALTER PROPERTY dimensions {
          USING (std::assert_exists(<shop::DimensionType>std::json_object_pack({('__typename', <std::json>._dimensions.__type__.name), ('fields', <std::json>std::array_agg(._dimensions.fields {
              name,
              required
          })), std::json_object_unpack(std::assert_exists(std::json_get(<std::json>._dimensions {
              Cylindrical := [IS shop::dimensions::Cylindrical] {
                  length,
                  diameter,
                  unit
              },
              Thread := [IS shop::dimensions::Thread] {
                  length,
                  diameter,
                  unit
              },
              Cuboid := [IS shop::dimensions::Cuboid] {
                  length,
                  width,
                  height,
                  unit
              },
              Mass := [IS shop::dimensions::Mass] {
                  mass,
                  unit
              },
              LiquidVolume := [IS shop::dimensions::LiquidVolume] {
                  volume,
                  unit
              },
              ISO216 := [IS shop::dimensions::ISO216] {
                  size,
                  thickness,
                  unit
              }
          }, (std::str_split(._dimensions.__type__.name, '::'))[-1])))})));
      };
  };
};
