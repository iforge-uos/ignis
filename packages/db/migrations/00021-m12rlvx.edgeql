CREATE MIGRATION m12rlvxtuhigcanugny5vuznapqwv2ycod7jpmrkr4ncvvqzen4qcq
    ONTO m1xa4ql5a5yeci7grm6ipelnjoe3tjgvbvvhk3nvrjhm7wzitjuoda
{
  ALTER TYPE shop::dimensions::Cuboid {
      ALTER PROPERTY height {
          SET TYPE std::float64;
      };
      ALTER PROPERTY length {
          SET TYPE std::float64;
      };
      ALTER PROPERTY width {
          SET TYPE std::float64;
      };
  };
  ALTER TYPE shop::dimensions::Cylindrical {
      ALTER PROPERTY diameter {
          SET TYPE std::float64;
      };
      ALTER PROPERTY length {
          SET TYPE std::float64;
      };
  };
  ALTER TYPE shop::dimensions::LiquidVolume {
      ALTER PROPERTY volume {
          SET TYPE std::float64;
      };
  };
  ALTER TYPE shop::dimensions::Mass {
      ALTER PROPERTY mass {
          SET TYPE std::float64;
      };
  };
  ALTER TYPE shop::dimensions::ThreadedBar {
      ALTER PROPERTY diameter {
          SET TYPE std::float64;
      };
      ALTER PROPERTY length {
          SET TYPE std::float64;
      };
  };
};
