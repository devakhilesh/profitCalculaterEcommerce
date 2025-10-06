/**

* lib/amazonCalculator.js
*
* Self-contained Amazon revenue / fee calculator.
*
* Exports:
* * computeAmazonRevenue(inputs)
*
* The function expects inputs (numbers) and returns a structured breakdown.
*
* Closing fee handling:
* * Provide closingFeeSlabs: [{min, max, fee, feeType:'fixed'|'percent'}]
* * OR provide fixedClosingAmount (fallback)
    */

function round2(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function calculateClosingFeeBySlabs(price, slabs = [], fallback = 0) {
  if (!Array.isArray(slabs) || slabs.length === 0) return round2(fallback || 0);
  for (const s of slabs) {
    const minOK = typeof s.min === "number" ? price >= s.min : true;
    const maxOK = typeof s.max === "number" ? price <= s.max : true;
    if (minOK && maxOK) {
      if (s.feeType === "percent") return round2((price * (s.fee || 0)) / 100);
      return round2(s.fee || 0);
    }
  }
  return round2(fallback || 0);
}

/**

* computeAmazonRevenue(inputs)
*
* Required:
* * sellingPrice (number)
* * costPrice (number)
*
* Optional / commonly used:
* * purchasePriceWithGst
* * referralPercent
* * closingFeeSlabs
* * fixedClosingAmount
* * gstPercent (for GST on platform fees)
* * rtoPercent, rtoCost
* * dtoPercent, dtoCost
* * perOrderPckExpense
* * storageFeesPerUnit
* * shippingCharge
* * shipping_Gst_per_order (percent or absolute)
* * isShippingPaidByCustomer (bool)
* * adsExpense (per-paid-order) OR adsTotal & expectedMonthlyOrders
* * wrongDamagePercent
* * overheadPerOrder
* * totalFixedCost
* * desiredProfit / desiredProfitPercent (optional - returns requiredSellingPriceForDesired)
*
* Returns:
* {
* 
  meta: {...},
  
* 
  breakdown: {...},
  
* 
  totals: {...},
  
* 
  requiredSellingPriceForDesired: number | null
  
* } 
  */
function computeAmazonRevenue(inputs = {}) {
  const inp = Object.assign(
    {
      referralPercent: 0,
      closingFeeSlabs: [],
      fixedClosingAmount: 0,
      gstPercent: 0,
      rtoPercent: 0,
      rtoCost: 0,
      dtoPercent: 0,
      dtoCost: 0,
      perOrderPckExpense: 0,
      storageFeesPerUnit: 0,
      shippingCharge: 0,
      shipping_Gst_per_order: 0,
      isShippingPaidByCustomer: true,
      adsExpense: 0,
      adsTotal: 0,
      expectedMonthlyOrders: 0,
      wrongDamagePercent: 0,
      overheadPerOrder: 0,
      totalFixedCost: 0,
      purchasePriceWithGst: null,
      desiredProfit: 0,
      desiredProfitPercent: 0,
    },
    inputs
  );

  if (
    typeof inp.sellingPrice !== "number" ||
    typeof inp.costPrice !== "number"
  ) {
    throw new Error(
      "sellingPrice and costPrice are required and must be numbers."
    );
  }

  // Convert percentages to fractions
  const rtoFrac = (inp.rtoPercent || 0) / 100;
  const dtoFrac = (inp.dtoPercent || 0) / 100;
  const wrongDamageFrac = (inp.wrongDamagePercent || 0) / 100;

  const successFraction = 1 - rtoFrac - dtoFrac;
  if (successFraction <= 0) {
    throw new Error("Invalid RTO/DTO values: success fraction <= 0.");
  }

  const dispatchesPerPaidOrder = 1 / successFraction;
  const rtoCountPerPaidOrder = dispatchesPerPaidOrder * rtoFrac;
  const dtoCountPerPaidOrder = dispatchesPerPaidOrder * dtoFrac;
  const wrongDamageCountPerPaidOrder = dispatchesPerPaidOrder * wrongDamageFrac;

  const purchasePriceWithGst =
    typeof inp.purchasePriceWithGst === "number"
      ? inp.purchasePriceWithGst
      : inp.costPrice;

  // Packaging/storage/shipping scaled to dispatches (spread over paid order)
  const packagingPerPaidOrder = round2(
    (inp.perOrderPckExpense || 0) * dispatchesPerPaidOrder
  );
  const storagePerPaidOrder = round2(
    (inp.storageFeesPerUnit || 0) * dispatchesPerPaidOrder
  );

  // Returns (RTO/DTO) expense: per-event costs multiplied by event counts per paid order
  const returnsExpensePerPaidOrder = round2(
    rtoCountPerPaidOrder * (inp.rtoCost || 0) +
      dtoCountPerPaidOrder * (inp.dtoCost || 0)
  );

  // Shipping: if seller pays shipping (isShippingPaidByCustomer === false), multiply shippingCharge by dispatches
  const shippingPerPaidOrder = inp.isShippingPaidByCustomer
    ? 0
    : round2((inp.shippingCharge || 0) * dispatchesPerPaidOrder);

  let shippingGstPerPaidOrder = 0;
  if (inp.shipping_Gst_per_order) {
    if (inp.shipping_Gst_per_order <= 100) {
      shippingGstPerPaidOrder = round2(
        (inp.shippingCharge || 0) *
          (inp.shipping_Gst_per_order / 100) *
          dispatchesPerPaidOrder
      );
    } else {
      shippingGstPerPaidOrder = round2(
        inp.shipping_Gst_per_order * dispatchesPerPaidOrder
      );
    }
  }

  // Ads: either per-paid-order or adsTotal spread across expectedMonthlyOrders
  let adsPerPaidOrder = 0;
  if (inp.adsExpense && inp.adsExpense > 0) {
    adsPerPaidOrder = inp.adsExpense;
  } else if (
    inp.adsTotal &&
    inp.expectedMonthlyOrders &&
    inp.expectedMonthlyOrders > 0
  ) {
    adsPerPaidOrder = round2(inp.adsTotal / inp.expectedMonthlyOrders);
  }

  // Fees: referral & closing
  const referralFee = round2(
    (inp.sellingPrice * (inp.referralPercent || 0)) / 100
  );
  const closingFee = round2(
    calculateClosingFeeBySlabs(
      inp.sellingPrice,
      inp.closingFeeSlabs || [],
      inp.fixedClosingAmount || 0
    )
  );
  const platformFees = round2(referralFee + closingFee);

  const gstOnPlatformFees = round2(
    (platformFees * (inp.gstPercent || 0)) / 100
  );

  const wrongDamageCost = round2(
    wrongDamageCountPerPaidOrder * purchasePriceWithGst
  );

  const totalFixedCostPerOrder = round2(inp.totalFixedCost || 0);

  const totalCostPerPaidOrder = round2(
    purchasePriceWithGst +
      packagingPerPaidOrder +
      storagePerPaidOrder +
      returnsExpensePerPaidOrder +
      adsPerPaidOrder +
      shippingPerPaidOrder +
      shippingGstPerPaidOrder +
      platformFees +
      gstOnPlatformFees +
      wrongDamageCost +
      round2(inp.overheadPerOrder || 0) +
      totalFixedCostPerOrder
  );

  const profitPerPaidOrder = round2(inp.sellingPrice - totalCostPerPaidOrder);
  const profitMarginOnSellingPrice = inp.sellingPrice
    ? round2((profitPerPaidOrder / inp.sellingPrice) * 100)
    : null;
  const profitOverCostPercent = totalCostPerPaidOrder
    ? round2((profitPerPaidOrder / totalCostPerPaidOrder) * 100)
    : null;

  let requiredSellingPriceForDesired = null;
  if (inp.desiredProfit && inp.desiredProfit > 0) {
    requiredSellingPriceForDesired = round2(
      totalCostPerPaidOrder + inp.desiredProfit
    );
  } else if (inp.desiredProfitPercent && inp.desiredProfitPercent > 0) {
    requiredSellingPriceForDesired = round2(
      totalCostPerPaidOrder * (1 + inp.desiredProfitPercent / 100)
    );
  }

  return {
    meta: {
      dispatchesPerPaidOrder: round2(dispatchesPerPaidOrder),
      rtoCountPerPaidOrder: round2(rtoCountPerPaidOrder),
      dtoCountPerPaidOrder: round2(dtoCountPerPaidOrder),
      wrongDamageCountPerPaidOrder: round2(wrongDamageCountPerPaidOrder),
    },
    breakdown: {
      purchasePriceWithGst: round2(purchasePriceWithGst),
      packagingPerPaidOrder,
      storagePerPaidOrder,
      returnsExpensePerPaidOrder,
      adsPerPaidOrder: round2(adsPerPaidOrder),
      shippingPerPaidOrder,
      shippingGstPerPaidOrder,
      referralFee,
      closingFee,
      platformFees,
      gstOnPlatformFees,
      wrongDamageCost,
      overheadPerOrder: round2(inp.overheadPerOrder || 0),
      totalFixedCostPerOrder,
    },
    totals: {
      totalCostPerPaidOrder,
      sellingPrice: round2(inp.sellingPrice),
      profitPerPaidOrder,
      profitMarginOnSellingPrice,
      profitOverCostPercent,
    },
    requiredSellingPriceForDesired,
  };
}

module.exports = { computeAmazonRevenue };

//=====================

/**

* controllers/amazonCalcController.js
*
* Updated controller that uses the calculator and saves results into the model.
*
* * POST /api/amazon/:platformId/calculate   -> compute & return (DOES NOT SAVE)
* * POST /api/amazon/:platformId             -> compute & save (existing create route)
*
* Adjust require paths to your project structure.
  */

const { isValidObjectId } = require("mongoose");
const AmazonModel = require("../../models/amazon/amazonSellingPriceCalcModel"); // replace with your model path
const { computeAmazonRevenue } = require("../../lib/amazonCalculator"); // replace path as needed

// compute-only endpoint (does not persist)
exports.calculateAmazonRevenue = async (req, res) => {
  try {
    const platformId = req.params.platformId;
    if (!platformId)
      return res
        .status(400)
        .json({ status: false, message: "Invalid platformId" });

    const inputs = req.body.inputs || req.body;
    // minimal validation
    if (
      typeof inputs.sellingPrice !== "number" ||
      typeof inputs.costPrice !== "number"
    ) {
      return res.status(400).json({
        status: false,
        message: "sellingPrice and costPrice are required in inputs (numbers)",
      });
    }

    const calcResult = computeAmazonRevenue(inputs);
    return res.status(200).json({ status: true, data: calcResult });
  } catch (err) {
    console.error("calculateAmazonRevenue err:", err);
    return res
      .status(500)
      .json({ status: false, message: err.message || "Internal error" });
  }
};

// create + compute + save (replaces your createAmazonSellingPriceCalc)
exports.createAmazonSellingPriceCalc = async (req, res) => {
  try {
    const platformId = req.params.platformId;
    if (!platformId) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid platformId" });
    }

    if (!req.body.productName) {
      return res.status(400).json({
        status: false,
        message: "Provide the Name of the product to make history for future",
      });
    }

    const inputs = req.body.inputs || req.body;
    if (
      typeof inputs.sellingPrice !== "number" ||
      typeof inputs.costPrice !== "number"
    ) {
      return res.status(400).json({
        status: false,
        message: "sellingPrice and costPrice are required in inputs (numbers)",
      });
    }

    req.body.userId = req.user._id;

    // compute
    const calcResult = computeAmazonRevenue(inputs);

    // prepare document to save (store inputs + breakdown + meta)
    const docToSave = {
      ...req.body, // keep user-supplied top-level fields (productName, sku, etc.)
      inputs,
      feeBreakdown: calcResult.breakdown,
      meta: calcResult.meta,
      platformId,
      userId: req.user._id,
      calculationDate: new Date(),
    };

    const saveData = await AmazonModel.create(docToSave);

    return res.status(201).json({ status: true, data: saveData });
  } catch (err) {
    console.error("createAmazonSellingPriceCalc err:", err);
    return res
      .status(500)
      .json({ status: false, message: err.message || "Internal error" });
  }
};

/**

* Keep your other functions (update/get/getAll/getById/delete) unchanged - they will read/write feeBreakdown/meta from the saved doc.
*
* If you want I can also give you a middleware to validate inputs strictly and a small unit test file.
  */
