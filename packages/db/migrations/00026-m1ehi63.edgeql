CREATE MIGRATION m1ehi63ixxmpifpvqjkman3aqqcfyqf4scsp4mw3nmbi3beeth3y6a
    ONTO m1tt3rh4fetj5w523yxiqaamuhdvi5g5277m67bk43k4hu6q6tmh2q
{
  ALTER TYPE shop::Dimension {
      DROP PROPERTY formatted;
  };
  ALTER TYPE shop::dimensions::Cuboid {
      CREATE REQUIRED PROPERTY formatted := ('\(.length) x \(.width) x \(.height)\(.unit)');
      DROP PROPERTY _formatted;
  };
  ALTER TYPE shop::dimensions::Cylindrical {
      CREATE REQUIRED PROPERTY formatted := ('\(.diameter)ø x \(.length)\(.unit)');
      DROP PROPERTY _formatted;
  };
  ALTER TYPE shop::dimensions::ISO216 {
      CREATE REQUIRED PROPERTY formatted := (SELECT
          ('\(.unit)\(.size) - \(std::assert_exists(.thickness))mm' IF EXISTS (.thickness) ELSE '\(.unit)\(.size)')
      );
      DROP PROPERTY _formatted;
  };
  ALTER TYPE shop::dimensions::LiquidVolume {
      CREATE REQUIRED PROPERTY formatted := ('\(.volume)\(.unit)');
      DROP PROPERTY _formatted;
  };
  ALTER TYPE shop::dimensions::Mass {
      CREATE REQUIRED PROPERTY formatted := ('\(.mass)\(.unit)');
      DROP PROPERTY _formatted;
  };
  ALTER TYPE shop::dimensions::Thread {
      CREATE REQUIRED PROPERTY formatted := ('M\(.diameter) x \(.length)\(.unit)');
      DROP PROPERTY _formatted;
  };
  CREATE FUNCTION shop::format_dimension(dim: shop::Dimension) ->  std::str USING (SELECT
      std::assert_single(std::assert_exists((IF (dim IS shop::dimensions::Cylindrical) THEN dim[IS shop::dimensions::Cylindrical].formatted ELSE (IF (dim IS shop::dimensions::Thread) THEN dim[IS shop::dimensions::Thread].formatted ELSE (IF (dim IS shop::dimensions::Cuboid) THEN dim[IS shop::dimensions::Cuboid].formatted ELSE (IF (dim IS shop::dimensions::Mass) THEN dim[IS shop::dimensions::Mass].formatted ELSE (IF (dim IS shop::dimensions::LiquidVolume) THEN dim[IS shop::dimensions::LiquidVolume].formatted ELSE (IF (dim IS shop::dimensions::ISO216) THEN dim[IS shop::dimensions::ISO216].formatted ELSE <std::str>std::assert(false)))))))))
  );
  ALTER FUNCTION shop::get_quantities(type_: schema::ObjectType) USING (SELECT
      (std::assert_exists((SELECT
          type_.pointers
      FILTER
          (.name NOT IN {'__type__', 'id', 'unit', 'formatted', 'quantities'})
      ))).name
  );
};
