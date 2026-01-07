import * as z from "zod/v4";
import * as zt from "zod-temporal";


// #region shop::DimensionType
export const DimensionTypeSchema = z.never();
// #endregion

// #region shop::Item
export const CreateItemSchema = z.
  object({
    icon_url: z.string(), // std::str
    name: z.string(), // std::str
    supplier: z.string(), // std::str
    supplier_url: z.string(), // std::str
  });

export const UpdateItemSchema = z.
  object({
    icon_url: z.string(), // std::str
    name: z.string(), // std::str
    supplier: z.string(), // std::str
    supplier_url: z.string(), // std::str
  });
// #endregion

// #region shop::LineItem
export const CreateLineItemSchema = z.
  object({
    price: z.bigint().min(-9223372036854775808n).max(9223372036854775807n), // std::int64
  });

export const UpdateLineItemSchema = z.
  object({
    price: z.bigint().min(-9223372036854775808n).max(9223372036854775807n), // std::int64
  });
// #endregion

// #region shop::Module
export const CreateModuleSchema = z.
  object({
    name: z.string(), // std::str
  });

export const UpdateModuleSchema = z.
  object({
    name: z.string(), // std::str
  });
// #endregion

// #region shop::Purchase
export const CreatePurchaseSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // shop::Purchase
    collected_at: zt.zonedDateTime().optional().nullable(), // std::datetime
    reverted: z.boolean().optional(), // std::bool
  });

export const UpdatePurchaseSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // shop::Purchase
    collected_at: zt.zonedDateTime().optional().nullable(), // std::datetime
    reverted: z.boolean().optional(), // std::bool
  });
// #endregion

// #region shop::Skew
export const CreateSkewSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
    created_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // shop::Skew
    colour: z.string().nullable(), // std::str
    icon_url: z.string().nullable(), // std::str
    price: z.bigint().min(-9223372036854775808n).max(9223372036854775807n), // std::int64
    till_id: z.int().min(-32768).max(32767), // std::int16
    count: z.int().min(-32768).max(32767).nullable(), // std::int16
  });

export const UpdateSkewSchema = z.
  object({ // default::Auditable
    updated_at: zt.zonedDateTime().optional(), // std::datetime
  })
  .extend({ // default::CreatedAt
  })
  .extend({ // shop::Skew
    colour: z.string().nullable(), // std::str
    icon_url: z.string().nullable(), // std::str
    price: z.bigint().min(-9223372036854775808n).max(9223372036854775807n), // std::int64
    till_id: z.int().min(-32768).max(32767), // std::int16
    count: z.int().min(-32768).max(32767).nullable(), // std::int16
  });
// #endregion
