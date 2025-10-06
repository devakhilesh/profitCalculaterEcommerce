const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const amazonRevenueCalcSchema = new mongoose.Schema(
  {
    // User and Product Identification

    userId: {
      type: ObjectId,
      required: true,
      ref: "userAuth",
      index: true,
    },

    platformId: {
      type: ObjectId,
      required: true,
      ref: "Platform",
      index: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    sku: {
      type: String,
      trim: true,
      index: true,
    },

    calculationName: {
      type: String,
      trim: true,
      default: "Amazon Revenue Calculation",
    },

    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    subcategoryName: {
      type: String,
      required: true,
      trim: true,
    },

    // Input Parameters
    inputs: {
      dispatch: {
        type: Number,
        required: true,
        min: 0,
      },
      RTO_percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      DTO_percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      amazon_return_charge: {
        type: Number,
        default: 0,
        min: 0,
      },
      ads_withGst: {
        type: Number,
        default: 0,
        min: 0,
      },
      wrong_damage_percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      perOrderPckExpense: {
        type: Number,
        default: 0,
        min: 0,
      },
      shipping_Gst_per_order: {
        type: Number,
        default: 0,
        min: 0,
      },
      costPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      profit: {
        type: Number,
        required: true,
        min: 0,
      },

      gstPercent: {
        type: Number,
        default: 0,
      },
    },

    // Calculated Results - Return Expense
    returnExpense: {
      totalDispatch: {
        type: Number,
        required: true,
        min: 0,
      },
      rtoPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      rtoOrders: {
        type: Number,
        required: true,
        min: 0,
      },
      totalDelivered: {
        type: Number,
        required: true,
        min: 0,
      },
      dtoPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      dtoOrders: {
        type: Number,
        required: true,
        min: 0,
      },
      ordersToBePaid: {
        type: Number,
        required: true,
        min: 0,
      },
      amazonReturnCharge: {
        type: Number,
        required: true,
        min: 0,
      },
      totalReturnAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      returnExpensePerOrder: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    // Calculated Results - Advertisement Expense
    advertisementExpense: {
      ordersToBePaid: { type: Number, required: true, min: 0 },
      totalAds: { type: Number, required: true, min: 0 },
      adsExpensePerOrder: { type: Number, required: true, min: 0 },
    },

    // Calculated Results - Wrong/Damage
    wrongDamage: {
      totalDispatch: { type: Number, required: true, min: 0 },
      wrongDamagePercentage: { type: Number, required: true, min: 0, max: 100 },
      wrongDamageCount: { type: Number, required: true, min: 0 },
      wrongDamagePerOrder: { type: Number, required: true, min: 0 },
    },

    // Calculated Results - Packaging Expense
    packagingExpense: {
      perOrderExpense: { type: Number, required: true, min: 0 },
      totalExpense: { type: Number, required: true, min: 0 },
      packagingPerPaidOrder: { type: Number, required: true, min: 0 },
    },

    platformFee: {
      type: Number,
      default: 0,
    },

    approxCost: {
      type: Number,
      default: 0.0,
    },

    // Final Calculation Results

    referralAmount: {
      type: Number,
      default: 0.0,
    },

    closingAmount: {
      type: Number,
      default: 0.0,
    },

    shipping: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    }, shippingType: {
      type: String,
      enum: ["fba", "selfShip", "easyShip", "sellerFlex"],
      required: true,
    },

    overHead: {
      type: Number,
      default: 0.0,
    },


    area: {
      type: String,
      enum: ["local", "regional", "national"],
      required: true,
    },

    weightKg: {
      type: Number,
      required: true,
    },



    finalSellingPrice: {
      type: Number,
      default: 0.0,
    },

    netRevenue: {
      type: Number,
      default: 0,
    },

    // Metadata and Status
    calculationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const amazonRevenueCalculationModel = mongoose.model(
  "amazonRevenueCalculation",
  amazonRevenueCalcSchema
);

module.exports = amazonRevenueCalculationModel;
