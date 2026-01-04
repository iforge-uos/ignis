CREATE MIGRATION m1udqpvjaoirdmr7773o2iaw2xfogxguqyygmpsyjhvzyv5xlrie5q
    ONTO m1yxdcupaaarhdhibol4bwy4dlvyzobxdrx3ws64ypuumy5uk5kjyq
{
  ALTER TYPE shop::Skew {
      CREATE REQUIRED LINK _dimensions: shop::Dimension {
          SET REQUIRED USING (.dimensions);
      };
  };
  ALTER TYPE shop::Skew {
      DROP PROPERTY _formatted_dimension;
  };
  ALTER TYPE shop::Skew {
      DROP LINK dimensions;
  };
  ALTER TYPE shop::Skew {
      CREATE REQUIRED PROPERTY dimensions := (std::assert_exists(<shop::DimensionType>std::json_object_pack({('__typename', <std::json>._dimensions.__type__.name), ('fields', <std::json>._dimensions.fields), std::json_object_unpack(std::assert_exists(std::json_get(<std::json>._dimensions {
          Cylindrical := [IS shop::dimensions::Cylindrical] {
              length,
              diameter
          },
          Thread := [IS shop::dimensions::Thread] {
              length,
              diameter
          },
          Cuboid := [IS shop::dimensions::Cuboid] {
              length,
              width,
              height
          },
          Mass := [IS shop::dimensions::Mass] {
              mass
          },
          LiquidVolume := [IS shop::dimensions::LiquidVolume] {
              volume
          },
          ISO216 := [IS shop::dimensions::ISO216] {
              size,
              thickness
          }
      }, (std::str_split(._dimensions.__type__.name, '::'))[-1])))})));
  };
};
