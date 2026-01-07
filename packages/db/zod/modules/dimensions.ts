import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region dimensions::Cuboid
export const CreateCuboidSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::Cuboid
    height: z.number(), // std::float64
    length: z.number(), // std::float64
    width: z.number(), // std::float64
  });

export const UpdateCuboidSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::Cuboid
    height: z.number(), // std::float64
    length: z.number(), // std::float64
    width: z.number(), // std::float64
  });
// #endregion

// #region dimensions::Cylindrical
export const CreateCylindricalSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::Cylindrical
    diameter: z.number(), // std::float64
    length: z.number(), // std::float64
  });

export const UpdateCylindricalSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::Cylindrical
    diameter: z.number(), // std::float64
    length: z.number(), // std::float64
  });
// #endregion

// #region dimensions::Dimension
export const CreateDimensionSchema = z.
  object({
  });

export const UpdateDimensionSchema = z.
  object({
  });
// #endregion

// #region dimensions::ISO216
export const CreateISO216Schema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::ISO216
    size: z.int().min(-32768).max(32767), // std::int16
    thickness: z.number().nullable(), // std::float64
  });

export const UpdateISO216Schema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::ISO216
    size: z.int().min(-32768).max(32767), // std::int16
    thickness: z.number().nullable(), // std::float64
  });
// #endregion

// #region dimensions::LiquidVolume
export const CreateLiquidVolumeSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::LiquidVolume
    volume: z.number(), // std::float64
  });

export const UpdateLiquidVolumeSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::LiquidVolume
    volume: z.number(), // std::float64
  });
// #endregion

// #region dimensions::Mass
export const CreateMassSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::Mass
    mass: z.number(), // std::float64
  });

export const UpdateMassSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::Mass
    mass: z.number(), // std::float64
  });
// #endregion

// #region dimensions::Thread
export const CreateThreadSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::Thread
    diameter: z.number(), // std::float64
    length: z.number(), // std::float64
  });

export const UpdateThreadSchema = z.
  object({ // dimensions::Dimension
  })
  .extend({ // dimensions::Thread
    diameter: z.number(), // std::float64
    length: z.number(), // std::float64
  });
// #endregion
