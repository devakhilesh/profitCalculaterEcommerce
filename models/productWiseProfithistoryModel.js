/* const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;

const platformProductProfitHistorySchema = new mongoose.Schema(
  {
    platformId: {
      type: ObjectId,
      required: true,
    },

    ProductName: {
      type: String,
      required: true,
    },
    ProductId: {
      type: String,
      default: `SKU_${this.ProductName.trim.substring(5)}143`,
    },

    cac: { type: Number, default: 0 }, // Ads Spend / Delivered Orders
    courierReturnLoss: { type: Number, default: 0 }, // Formula-based
    customerReturnCost: { type: Number, default: 0 }, // Formula-based
    damageCost: { type: Number, default: 0 }, // Formula-based

    sellingPrice: {
      type: Number,
      default: 0,
    },

    gstRate: {
      type: Number,
      default: 18,
    },

    withGST: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },
    // for meesho sepent on ad per user gst return amount  will be calculated on per user ads cost *cac gst return
    cacGstReturnPer: {
      type: Number,
      default: 0,
    },

    cacGstReturnAmount: {
      type: Number,
      default: 0,
    },

    customerReturnCost: {
      type: Number,
      default: 0,
    },



  },
  { timestamps: true }
);

const PlatformProductProfitHistoryModel = mongoose.model(
  "PlatformProductProfitHistoryModel",
  platformProductProfitHistorySchema
);

module.exports = PlatformProductProfitHistoryModel;
 */

// const mongoose = require("mongoose");
// const { Schema, Types } = mongoose;
// const ObjectId = Types.ObjectId;

// /* ---------------------------
//    Order metrics (counts/aggregates)
//    --------------------------- */
// const orderMetricsSchema = new Schema(
//   {
//     totalOrders: { type: Number, default: 0 },
//     totalDeliveredOrders: { type: Number, default: 0 },
//     spentOnAds: { type: Number, default: 0 },
//     courierReturnRTO: { type: Number, default: 0 }, // returned by courier / RTO count or amount — pick one semantics
//     perRTOPackagingCost: { type: Number, default: 0 },

//     customerReturns: { type: Number, default: 0 },

//     perReturnsByCustomerCost: {
//       type: Number,
//       default: 0,
//     }, // Meesho Admin panel depend on company 160 approx

//     damageReturns: { type: Number, default: 0 },
//   },
//   { _id: false }
// );

// /* ---------------------------
//    Per-order specific costs (costs averaged / per-item)
//    --------------------------- */
// const perOrderSpecificCostSchema = new Schema(
//   {
//     cacPerOrder: {
//       amount: { type: Number, default: 0 }, //adsSpent/totalDeliveredOrders   // Customer Acquisition Cost per delivered order
//       gstPercent: { type: Number, default: 0 }, // user Input in Percent
//       gstAmount: { type: Number, default: 0 }, // amount *gstPercent
//     },

//     courierReturnLoss: {
//       amount: { type: Number, default: 0 }, // formula perRTOPackagingCost*courierReturnRTO/totalDeliveredOrders
//       gstPercent: { type: Number, default: 0 }, //userInput
//       gstAmount: { type: Number, default: 0 }, // amount *gstPercent
//     },

//     customerReturnCost: {
//       amount: { type: Number, default: 0 }, //perReturnsByCustomerCost*customerReturns/totalDeliveredOrders // cost incurred per customer return
//       gstPercent: { type: Number, default: 0 }, // userInput
//       gstAmount: { type: Number, default: 0 }, // amount*gstPercent
//     },

//     damageCost: {
//       amount: { type: Number, default: 0 }, //costPrice*damageReturns/totalDeliveredOrders
//       //
//       // cost per damaged item
//       gstPercent: { type: Number, default: 0 },
//       gstAmount: { type: Number, default: 0 },
//     },
//   },
//   { _id: false }
// );

// /* ---------------------------
//    Direct costs for a product/order (selling price, packing, shipping)
//    --------------------------- */
// const productOrderDirectCostsSchema = new Schema(
//   {
//     sellingPrice: {
//       amount: { type: Number, default: 0 },
//       gstPercent: { type: Number, default: 0 },
//       gstAmount: { type: Number, default: 0 }, // positive
//       priceWithoutGst: { type: Number, default: 0 },
//     },

//     packagingCost: {
//       amount: { type: Number, default: 0 },
//       gstPercent: { type: Number, default: 0 },
//       gstAmount: { type: Number, default: 0 },
//     },

//     shippingCost: {
//       amount: { type: Number, default: 0 },
//       gstPercent: { type: Number, default: 0 },
//       gstAmount: { type: Number, default: 0 }, // gst returns
//     },

//     tcs: {
//       amount: { type: Number, default: 0 }, // Tax Collected at Source amount (if applicable)
//       percent: { type: Number, default: 0 }, // separate percent field is clearer than wrongly named gstReturnPercent
//       amountGst: { type: Number, default: 0 }, // gst returns
//     },

//     tds: {
//       amount: { type: Number, default: 0 }, // TDS amount
//       percent: { type: Number, default: 0 },
//       amountGst: { type: Number, default: 0 }, // gst returns
//     },
//     costPrice: {
//       amount: { type: Number, default: 0 }, // Customer Acquisition Cost per delivered order
//       gstPercent: { type: Number, default: 0 },
//       gstAmount: { type: Number, default: 0 }, // gst return
//     },
//   },
//   { _id: false }
// );

// /* ---------------------------
//    Root schema (product-level profit/loss analytics)
//    ---------------------------
//    */

// const platformProductProfitSchema = new Schema(
//   {
//     platformId: {
//       type: ObjectId,
//       required: true,
//       ref: "Platform",
//       index: true,
//     },

//     productName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     sku: {
//       type: String,
//       trim: true,
//       index: true,
//     },

//     orderMetrics: {
//       type: orderMetricsSchema,
//       default: () => ({}),
//     },

//     deliveredOrdersPerOrderCost: {
//       type: perOrderSpecificCostSchema,
//       default: () => ({}),
//     },

//     orderDirectCosts: {
//       type: productOrderDirectCostsSchema,
//       default: () => ({}),
//     },

//     netSettlement: {
//       amount: { type: Number, default: 0 },
//       gstPercent: { type: Number, default: 0 },
//       gstAmount: { type: Number, default: 0 }, //always will be 0
//     },

//     netGstSttlement: {
//       type: Number,
//       default: 0,
//     },

//     profit: {
//       amount: { type: Number, default: 0 },
//     },
//   },
//   { timestamps: true }
// );

// const productSPCP_ProfitLossCalcModel = mongoose.model(
//   "PlatformProductProfitHistory",
//   platformProductProfitSchema,
//   "platform_product_profit_histories" // optional explicit collection name
// );

// module.exports = productSPCP_ProfitLossCalcModel;

// ================== New ==============

const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

/* --------------------------- Order metrics --------------------------- */
const orderMetricsSchema = new Schema(
  {
    totalOrders: { type: Number, default: 0 },
    totalDeliveredOrders: { type: Number, default: 0 },
    spentOnAds: { type: Number, default: 0 },
    courierReturnRTO: { type: Number, default: 0 },
    perRTOPackagingCost: { type: Number, default: 0 },
    customerReturns: { type: Number, default: 0 },
    perReturnsByCustomerCost: { type: Number, default: 0 },
    damageReturns: { type: Number, default: 0 },
  },
  { _id: false }
);

/* --------------------------- Per-order costs --------------------------- */
const perOrderSpecificCostSchema = new Schema(
  {
    cacPerOrder: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 }, //18 %
      gstAmount: { type: Number, default: 0 },
    },
    courierReturnLoss: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
    },
    customerReturnCost: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
    },
    damageCost: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

/* --------------------------- Direct costs --------------------------- */
const productOrderDirectCostsSchema = new Schema(
  {
    sellingPrice: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      priceWithoutGst: { type: Number, default: 0 },
    },
    packagingCost: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
    },
    shippingCost: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
    },
    tcs: {
      amount: { type: Number, default: 0 },
      percent: { type: Number, default: 0 },
      amountGst: { type: Number, default: 0 },
    },
    tds: {
      amount: { type: Number, default: 0 },
      percent: { type: Number, default: 0 },
      amountGst: { type: Number, default: 0 },
    },
    costPrice: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

/* --------------------------- Root schema --------------------------- */
const platformProductProfitSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "userAuth",
    },
    platformId: {
      type: ObjectId,
      required: true,
      ref: "Platform",
    },
    productName: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, index: true },

    orderMetrics: { type: orderMetricsSchema, default: () => ({}) },
    deliveredOrdersPerOrderCost: {
      type: perOrderSpecificCostSchema,
      default: () => ({}),
    },
    orderDirectCosts: {
      type: productOrderDirectCostsSchema,
      default: () => ({}),
    },

    netSettlement: {
      amount: { type: Number, default: 0 },
      gstPercent: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
    },
    netGstSttlement: { type: Number, default: 0 },

    profit: { amount: { type: Number, default: 0 } },
  },
  { timestamps: true }
);

const productSPCP_ProfitLossCalcModel = mongoose.model(
  "PlatformProductProfitHistory",
  platformProductProfitSchema,
  "platform_product_profit_histories"
);

module.exports = productSPCP_ProfitLossCalcModel;
