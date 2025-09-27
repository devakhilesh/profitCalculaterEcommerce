const mongoose = require("mongoose");

const sellingPriceCalculatorSchema = new mongoose.Schema(
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
      default: "Selling Price Calculation",
    },
    // Input Parameters
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

    desiredProfit: {
      type: Number,
      default: 0.0,
    },

    // Fixed Costs

    totalFixedCost: {
      type: Number,
      default: 0.0,
    },

    sellingPrice: {
      type: Number,
      default: 0.0,
    },
  },
  { timestamps: true }
);

const SellingPriceCalculatorModel = mongoose.model(
  "SellingPriceCalculator",
  sellingPriceCalculatorSchema
);

module.exports = SellingPriceCalculatorModel;