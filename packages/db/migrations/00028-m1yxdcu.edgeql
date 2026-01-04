CREATE MIGRATION m1yxdcupaaarhdhibol4bwy4dlvyzobxdrx3ws64ypuumy5uk5kjyq
    ONTO m1ttf5nnsr2xl5lotaum6dlrjqbmpfplh267iw7fbkgssipelnugqa
{
  ALTER TYPE shop::Skew {
      ALTER PROPERTY _formatted_dimension {
          USING (SELECT
              std::assert_exists(<shop::DimensionType><std::json>.dimensions {
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
              })
          );
      };
  };
};
