const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const sellingPriceCalcSchema = new mongoose.Schema(
  {
    // User and Product Identification
    userId: {
      type: ObjectId,
      required: true,
      ref: "userAuth",
      index: true
    },
    platformId: {
      type: ObjectId,
      required: true,
      ref: "Platform",
      index: true
    },
    productName: { 
      type: String, 
      required: true, 
      trim: true,
      index: true 
    },
    sku: { 
      type: String, 
      trim: true, 
      index: true 
    },
    calculationName: {
      type: String,
      trim: true,
      default: "Selling Price Calculation"
    },
    
    // Input Parameters
    inputs: {
      dispatch: { 
        type: Number, 
        required: true,
         min: 0 },
      RTO_percent: {
         type: Number,
          default: 0,
           min: 0,
            max: 100 
        },
      DTO_percent: { 
        type: Number, 
        default: 0,
         min: 0,
          max: 100 
        },
      meesho_return_charge: {
         type: Number,
          default: 0, min: 0 },
      ads_withGst: {
         type: Number,
          default: 0,
           min: 0 
        },
      wrong_damage_percent: { 
        type: Number, 
        default: 0,
         min: 0,
          max: 100
         },
      perOrderPckExpense: { 
        type: Number,
         default: 0, 
         min: 0 
        },
      shipping_Gst_per_order: {
         type: Number,
          default: 0,
           min: 0 
        },
      costPrice: {
         type: Number,
          required: true,
           min: 0
         },
      profit: { 
        type: Number,
         required: true,
          min: 0 
        }
    },
    
    // Calculated Results - Return Expense
    returnExpense: {
      totalDispatch: {
         type: Number, 
         required: true,
          min: 0 
        },
      rtoPercentage: {
         type: Number, 
         required: true,
          min: 0,
           max: 100 
        },
      rtoOrders: {
         type: Number,
          required: true,
           min: 0 
        },
      totalDelivered: {
         type: Number,
          required: true,
           min: 0 
        },
      dtoPercentage: { 
        type: Number,
         required: true,
          min: 0, max: 100 
        },
      dtoOrders: {
         type: Number,
          required: true,
           min: 0 
        },
      ordersToBePaid: { 
        type: Number,
         required: true,
          min: 0 },
      meeshoReturnCharge: { 
        type: Number,
         required: true,
          min: 0 
        },
      totalReturnAmount: {
         type: Number,
          required: true,
           min: 0 
        },
      returnExpensePerOrder: { 
        type: Number,
         required: true, min: 0
         }
    },
    
    // Calculated Results - Advertisement Expense
    advertisementExpense: {
      ordersToBePaid: { type: Number, required: true, min: 0 },
      totalAds: { type: Number, required: true, min: 0 },
      adsExpensePerOrder: { type: Number, required: true, min: 0 }
    },
    
    // Calculated Results - Wrong/Damage
    wrongDamage: {
      totalDispatch: { type: Number, required: true, min: 0 },
      wrongDamagePercentage: { type: Number, required: true, min: 0, max: 100 },
      wrongDamageCount: { type: Number, required: true, min: 0 },
      wrongDamagePerOrder: { type: Number, required: true, min: 0 }
    },
    
    // Calculated Results - Packaging Expense
    packagingExpense: {
      perOrderExpense: { type: Number, required: true, min: 0 },
      totalExpense: { type: Number, required: true, min: 0 },
      packagingPerPaidOrder: { type: Number, required: true, min: 0 }
    },
    
    // Final Calculation Results
    finalCalculation: {
      purchasePrice: { type: Number, required: true, min: 0 },
      packagingExpense: { type: Number, required: true, min: 0 },
      returnCharge: { type: Number, required: true, min: 0 },
      adsExpense: { type: Number, required: true, min: 0 },
      shippingGst: { type: Number, required: true, min: 0 },
      wrongDamage: { type: Number, required: true, min: 0 },
      totalCost: { type: Number, required: true, min: 0 },
      desiredProfit: { type: Number, required: true, min: 0 },
      profitPerPaidOrder: { type: Number, required: true, min: 0 },
      finalSellingPrice: { type: Number, required: true, min: 0 }
    },
    
    // Metadata and Status
    calculationDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    
  },
  { 
    timestamps: true,

  }
);

 const SellingPriceCalculationModel = mongoose.model("SellingPriceCalculation", sellingPriceCalcSchema);

 module.exports = SellingPriceCalculationModel