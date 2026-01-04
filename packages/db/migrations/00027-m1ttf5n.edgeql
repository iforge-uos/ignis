CREATE MIGRATION m1ttf5nnsr2xl5lotaum6dlrjqbmpfplh267iw7fbkgssipelnugqa
    ONTO m1ehi63ixxmpifpvqjkman3aqqcfyqf4scsp4mw3nmbi3beeth3y6a
{
  CREATE SCALAR TYPE shop::DimensionType EXTENDING std::json;
  DROP FUNCTION shop::format_dimension(dim: shop::Dimension);
  DROP FUNCTION shop::get_quantities(type_: schema::ObjectType);
  ALTER TYPE shop::Dimension {
      CREATE REQUIRED LINK fields := (std::assert_exists((SELECT
          .__type__.pointers
      FILTER
          (.name NOT IN {'__type__', 'id', 'unit', 'formatted', 'fields'})
      )));
  };
  ALTER TYPE shop::Skew {
      CREATE REQUIRED PROPERTY _formatted_dimension := (SELECT
          <shop::DimensionType>.dimensions {
              __typename := .__type__.name,
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
          }
      );
      ALTER PROPERTY count {
          CREATE ANNOTATION std::description := "Empty if not stock isn't tracked";
      };
  };
};
