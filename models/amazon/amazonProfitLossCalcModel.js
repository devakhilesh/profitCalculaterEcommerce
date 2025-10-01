const mongoose = require("mongoose");

const amazon_ProfitLossCalculatorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "userAuth",
      index: true,
    },
    platformId: {
      type: mongoose.Schema.Types.ObjectId,
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
      default: "Amazon Selling Price Calculation",
    },
    // Input Parameters

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

    platformFee: {
      type: Number,
      default: 0.0,
    },

    shippingType: {
      type: String,
      enum: ["fba", "selfShip", "easyShip", "sellerFlex"],
      required: true,
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

    gstPercent: {
      type: Number,
      default: 18.0,
    },

    gstAmount: {
      type: Number,
      default: 0.0,
    },

    referralAmount: {
      type: Number,
      default: 0.0,
    },

    closingAmount: {
      type: Number,
      default: 0.0,
    },

    rtoPercent: {
      type: Number,
      default: 0,
    },
    rtoCost: {
      type: Number,
      default: 0,
    },
    dtoPercent: {
      type: Number,
      default: 0,
    },
    dtoCost: {
      type: Number,
      default: 0,
    },
    rtoNorm: {
      type: Number,
      default: 0.0,
    },
    dtoNorm: {
      type: Number,
      default: 0.0,
    },
    totalRiskCost: {
      type: Number,
      default: 0.0,
    },

    // ads with gst
    adsExpense: {
      type: Number,
      default: 0.0,
    },

    totalExpenseWithGst: {
      type: Number,
      default: 0.0,
    },

    //wrong damage percent
    wrongDamagePercent: {
      type: Number,
      default: 0,
    },

    wrongDamageNorm: {
      type: Number,
      default: 0.0,
    },
    // Order Packaging Cost

    perOrderPckExpense: {
      type: Number,
      default: 0.0,
    },

    // Purchase Price + GST
    purchasePriceWithGst: {
      type: Number,
      default: 0.0,
    },

    shippingCharge: {
      type: Number,
      default: 0.0,
    },

    overHead: {
      type: Number,
      default: 0.0,
    },

    // Fixed Costs

    totalFixedCost: {
      type: Number,
      default: 0.0,
    },

    subSellingPrice: {
      type: Number,
      default: 0.0,
    },

    finalSellingPrice: {
      type: Number,
      default: 0.0,
    },

    userProvidedSellingPrice: {
      type: Number,
      default: 0.0,
    },

    profitLossAmount: {
      type: Number,
      default: 0.0,
    },
  },
  { timestamps: true }
);

const Amazon_ProfitLossCalculatorModel = mongoose.model(
  "AmazonProfitLossCalculator",
  amazon_ProfitLossCalculatorSchema
);

module.exports = Amazon_ProfitLossCalculatorModel;
