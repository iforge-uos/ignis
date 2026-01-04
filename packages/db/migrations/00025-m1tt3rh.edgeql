CREATE MIGRATION m1tt3rh4fetj5w523yxiqaamuhdvi5g5277m67bk43k4hu6q6tmh2q
    ONTO m1kigxdudfuxithqerfbfkenlfflukqktzfppcdvwule6tkdudmq7q
{
  ALTER FUNCTION shop::get_quantities(type_: schema::ObjectType) USING (SELECT
      (std::assert_exists((SELECT
          type_.pointers
      FILTER
          (.name NOT IN {'__type__', 'id', 'unit', 'formatted', '_formatted', 'quantities'})
      ))).name
  );
  ALTER TYPE shop::dimensions::Cuboid {
      DROP PROPERTY formatted;
  };
  ALTER TYPE shop::dimensions::Cylindrical {
      DROP PROPERTY formatted;
  };
  ALTER TYPE shop::dimensions::ISO216 {
      DROP PROPERTY formatted;
  };
  ALTER TYPE shop::dimensions::LiquidVolume {
      DROP PROPERTY formatted;
  };
  ALTER TYPE shop::dimensions::Mass {
      DROP PROPERTY formatted;
  };
  ALTER TYPE shop::dimensions::Thread {
      DROP PROPERTY formatted;
  };
  ALTER TYPE shop::Dimension {
      CREATE REQUIRED PROPERTY formatted := (SELECT
          std::assert_exists(<std::str>std::json_get(<std::json>__source__, '_formatted'))
      );
  };
  ALTER TYPE shop::dimensions::Cuboid {
      CREATE REQUIRED PROPERTY _formatted := ('\(.length) x \(.width) x \(.height)\(.unit)');
  };
  ALTER TYPE shop::dimensions::Cylindrical {
      CREATE REQUIRED PROPERTY _formatted := ('\(.diameter)ø x \(.length)\(.unit)');
  };
  ALTER TYPE shop::dimensions::ISO216 {
      CREATE REQUIRED PROPERTY _formatted := (SELECT
          ('\(.unit)\(.size) - \(std::assert_exists(.thickness))mm' IF EXISTS (.thickness) ELSE '\(.unit)\(.size)')
      );
  };
  ALTER TYPE shop::dimensions::LiquidVolume {
      CREATE REQUIRED PROPERTY _formatted := ('\(.volume)\(.unit)');
  };
  ALTER TYPE shop::dimensions::Mass {
      CREATE REQUIRED PROPERTY _formatted := ('\(.mass)\(.unit)');
  };
  ALTER TYPE shop::dimensions::Thread {
      CREATE REQUIRED PROPERTY _formatted := ('M\(.diameter) x \(.length)\(.unit)');
  };
};
